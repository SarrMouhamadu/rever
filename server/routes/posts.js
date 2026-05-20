const express = require('express');
const db = require('../database');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimit');
const { idempotency } = require('../middleware/idempotency');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const offset = parseInt(req.query.offset, 10) || 0;
    const feed = await db.getFeed(req.user.id, limit, offset);
    res.json(feed);
  } catch {
    res.status(500).json({ error: 'Erreur lors de la récupération du feed' });
  }
});

const { broadcastNotification } = require('../lib/notificationHub');

router.post('/', requireAuth, idempotency, uploadLimiter, upload.single('image'), async (req, res) => {
  try {
    const { text, isAnonymous } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Le texte est requis.' });
    }
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const isAnon = isAnonymous === undefined ? true : (isAnonymous === 'true' || isAnonymous === true);
    const created = await db.createPost(req.user.id, text, imageUrl, isAnon);
    const post = await db.getEnrichedPostById(created.id, req.user.id);

    const authorInitials = (req.user.first_name.charAt(0) + req.user.last_name.charAt(0)).toUpperCase();
    const maskedAuthor = req.user.role === 'user' ? authorInitials : req.user.pseudo;

    broadcastNotification({
      type: 'new-post',
      title: 'Nouvelle publication',
      body: isAnon ? 'Une nouvelle confession anonyme a été publiée.' : `${maskedAuthor} a publié un message.`,
      content: text,
      postId: post.id,
      isAnonymous: isAnon,
      author: isAnon ? 'Anonyme' : maskedAuthor,
      post,
    }, req.user.id, 'new-post');

    const notifMsg = isAnon ? 'Une nouvelle confession anonyme a été publiée.' : `${maskedAuthor} a publié un espace d'expression.`;
    await db.createNotificationForAll('post', post.id, req.user.id, notifMsg);

    res.json(post);
  } catch (err) {
    if (err.message?.includes('autorisées')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const result = await db.likePost(req.params.id, req.user.id);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Erreur lors du like' });
  }
});

router.post('/:id/comment', requireAuth, idempotency, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Commentaire vide.' });
    }
    const comment = await db.addComment(req.params.id, req.user.id, text);

    const authorInitials = (req.user.first_name.charAt(0) + req.user.last_name.charAt(0)).toUpperCase();
    const maskedAuthor = req.user.role === 'user' ? authorInitials : req.user.pseudo;
    const notifMsg = `${maskedAuthor} a commenté un post.`;
    await db.createNotificationForAll('comment', req.params.id, req.user.id, notifMsg);
    broadcastNotification({
      type: 'new-comment',
      title: 'Nouveau commentaire',
      body: notifMsg,
      postId: parseInt(req.params.id, 10),
      comment,
    }, req.user.id, 'new-comment');

    res.json(comment);
  } catch {
    res.status(500).json({ error: "Erreur lors de l'ajout du commentaire" });
  }
});

router.delete('/comment/:commentId', requireAuth, async (req, res) => {
  try {
    const success = await db.deleteComment(req.params.commentId, req.user.id);
    if (!success) {
      return res.status(403).json({ error: 'Non autorisé ou commentaire introuvable.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression du commentaire" });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await db.getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post non trouvé.' });
    if (post.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Action non autorisée.' });
    }
    await db.updatePost(req.params.id, text);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur lors de la modification.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await db.getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post non trouvé.' });
    if (post.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Action non autorisée.' });
    }
    await db.deletePost(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

router.post('/:postId/report', requireAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    await db.reportPost(req.params.postId, reason);
    res.json({ success: true });
  } catch (err) {
    console.error('Error reporting post:', err);
    res.status(500).json({ error: 'Erreur lors du signalement.' });
  }
});

module.exports = router;
