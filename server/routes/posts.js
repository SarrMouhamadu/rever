const express = require('express');
const db = require('../database');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimit');
const { idempotency } = require('../middleware/idempotency');

const router = express.Router();

const maskedActorLabel = (user) => {
  if (user.role === 'user') {
    return (user.first_name.charAt(0) + user.last_name.charAt(0)).toUpperCase();
  }
  return user.pseudo;
};

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
const { notifyUser, notifyAllExcept } = require('../lib/userNotify');
const { APP_URL } = require('../lib/pushService');

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

    // Récupérer l'utilisateur complet pour maskedActorLabel
    const fullUser = await db.getUserById(req.user.id);
    const maskedAuthor = maskedActorLabel(fullUser);
    const isCoach = req.user.role === 'coach';

    if (isCoach) {
      const notifMsg = `${req.user.pseudo} a publié un message (coach).`;
      try {
        await notifyAllExcept(req.user.id, {
          type: 'coach-post',
          sourceId: post.id,
          message: notifMsg,
          pushTitle: 'Publication coach',
          pushBody: notifMsg,
          url: `${APP_URL}/`,
          sseBroadcast: {
            eventName: 'coach-post',
            payload: {
              type: 'coach-post',
              title: 'Publication coach',
              body: notifMsg,
              content: text,
              postId: post.id,
              author: req.user.pseudo,
              post,
            },
          },
        });
      } catch (notificationError) {
        console.error('Notification error (coach-post):', notificationError);
      }
    } else {
      const notifMsg = isAnon
        ? 'Une nouvelle confession anonyme a été publiée.'
        : `${maskedAuthor} a publié un espace d'expression.`;
      const feedBody = isAnon
        ? 'Une nouvelle confession anonyme a été publiée.'
        : `${maskedAuthor} a publié un message.`;
      try {
        await notifyAllExcept(req.user.id, {
          type: 'post',
          sourceId: post.id,
          message: notifMsg,
          pushTitle: 'Nouvelle publication',
          pushBody: feedBody,
          url: `${APP_URL}/`,
          sseBroadcast: {
            eventName: 'new-post',
            payload: {
              type: 'new-post',
              title: 'Nouvelle publication',
              body: feedBody,
              content: text,
              postId: post.id,
              isAnonymous: isAnon,
              author: isAnon ? 'Anonyme' : maskedAuthor,
              post,
            },
          },
        });
      } catch (notificationError) {
        console.error('Notification error (post):', notificationError);
      }
    }

    res.json(post);
  } catch (err) {
    if (err.message?.includes('autorisées')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error creating post:', err);
    res.status(500).json({ error: err.message || 'Erreur lors de la création' });
  }
});

router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const post = await db.getPostById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Publication introuvable.' });
    }

    const result = await db.likePost(postId, req.user.id);

    if (result.wasNewLike && post.user_id !== req.user.id) {
      const masked = maskedActorLabel(req.user);
      const notifMsg = `${masked} a aimé votre publication.`;
      await notifyUser(post.user_id, {
        type: 'like',
        sourceId: postId,
        actorId: req.user.id,
        message: notifMsg,
        pushTitle: 'Nouveau like',
        pushBody: notifMsg,
        url: `${APP_URL}/`,
        sseEvent: 'post-liked',
        ssePayload: {
          type: 'post-liked',
          title: 'Nouveau like',
          body: notifMsg,
          postId,
          actorId: req.user.id,
        },
      });
    }

    res.json(result);
  } catch {
    res.status(500).json({ error: 'Erreur lors du like' });
  }
});

router.post('/:id/comment', requireAuth, idempotency, async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const post = await db.getPostById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Publication introuvable.' });
    }

    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Commentaire vide.' });
    }
    const comment = await db.addComment(postId, req.user.id, text);

    const maskedAuthor = maskedActorLabel(req.user);

    if (post.user_id !== req.user.id) {
      const notifMsg = `${maskedAuthor} a commenté votre publication.`;
      await notifyUser(post.user_id, {
        type: 'comment',
        sourceId: postId,
        actorId: req.user.id,
        message: notifMsg,
        pushTitle: 'Nouveau commentaire',
        pushBody: notifMsg,
        url: `${APP_URL}/`,
        sseEvent: 'post-commented',
        ssePayload: {
          type: 'post-commented',
          title: 'Nouveau commentaire',
          body: notifMsg,
          postId,
          comment,
          actorId: req.user.id,
        },
      });
    }

    broadcastNotification(
      {
        type: 'new-comment',
        title: 'Nouveau commentaire',
        body: `${maskedAuthor} a commenté une publication.`,
        postId,
        comment,
      },
      req.user.id,
      'new-comment'
    );

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
