import React, { useState, useEffect, useCallback } from 'react';
import api from './api/client';
import { useAuth } from './context/AuthContext';
import { useTheme } from './hooks/useTheme';
import { getFullImageUrl } from './utils/imageUrl';
import LandingPage from './LandingPage';
import ContactPage from './ContactPage';
function App() {
  const { user, login, register, logout, exportData, deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [showLanding, setShowLanding] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [view, setView] = useState(() => {
    const savedUser = localStorage.getItem('rever_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      return parsedUser.role === 'admin' ? 'admin-dashboard' : 'feed';
    }
    return 'login';
  });
  
  const [authForm, setAuthForm] = useState({ firstName: '', lastName: '', contact: '', password: '', pseudo: '', loginId: '' });
  const [authError, setAuthError] = useState('');

  const [feed, setFeed] = useState([]);
  const [feedOffset, setFeedOffset] = useState(0);
  const [feedHasMore, setFeedHasMore] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostText, setEditingPostText] = useState('');
  const [quote, setQuote] = useState("Le premier pas vers le bien-être est d’oser exprimer ce que l’on ressent. Vous êtes au bon endroit.");
  const [adminNewQuote, setAdminNewQuote] = useState("");
  const [quoteCopied, setQuoteCopied] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [newPostImagePreview, setNewPostImagePreview] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});

  const [contacts, setContacts] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminTab, setAdminTab] = useState('metrics');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState('all');
  const [totalUnread, setTotalUnread] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const userData = await register(authForm);
      setView('feed');
    } catch (err) {
      setAuthError(err.response?.data?.error || "Erreur lors de l'inscription");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const userData = await login(authForm.loginId, authForm.password);
      setView(userData.role === 'admin' ? 'admin-dashboard' : 'feed');
    } catch (err) {
      setAuthError(err.response?.data?.error || "Identifiants incorrects");
    }
  };

  const handleLogout = () => {
    logout();
    setView('login');
    setAuthForm({ firstName: '', lastName: '', contact: '', password: '', pseudo: '', loginId: '' });
  };

  const fetchFeed = useCallback(async (offset = 0, append = false) => {
    setFeedLoading(true);
    try {
      const res = await api.get('/api/posts', { params: { limit: 20, offset } });
      const { posts, hasMore } = res.data;
      setFeed((prev) => (append ? [...prev, ...posts] : posts));
      setFeedOffset(offset + posts.length);
      setFeedHasMore(hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setNewPostImage(file);
      setNewPostImagePreview(URL.createObjectURL(file));
    } else {
      alert('Seules les images sont autorisées !');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    
    const formData = new FormData();
    formData.append('text', newPostText);
    formData.append('isAnonymous', isAnonymous);
    if (newPostImage) {
      formData.append('image', newPostImage);
    }
    
    await api.post('/api/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    setNewPostText('');
    setNewPostImage(null);
    setNewPostImagePreview(null);
    setIsAnonymous(true);
    fetchFeed(0, false);
  };

  const handleLike = async (postId) => {
    const post = feed.find((p) => p.id === postId);
    if (post?.liked_by_me) return;
    setFeed((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likes: p.likes + 1, liked_by_me: true } : p
      )
    );
    try {
      const res = await api.post(`/api/posts/${postId}/like`);
      setFeed((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes: res.data.likes, liked_by_me: res.data.liked_by_me } : p
        )
      );
    } catch (error) {
      console.error(error);
      fetchFeed(0, false);
    }
  };

  const handleCommentInputChange = (postId, text) => {
    setCommentInputs({ ...commentInputs, [postId]: text });
  };

  const handleComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    
    try {
      const comment = await api.post(`/api/posts/${postId}/comment`, { text });
      setCommentInputs({ ...commentInputs, [postId]: '' });
      setFeed((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...(p.comments || []), comment.data] }
            : p
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdatePost = async (postId) => {
    if (!editingPostText.trim()) return;
    try {
      await api.put(`/api/posts/${postId}`, { text: editingPostText });
      setEditingPostId(null);
      setEditingPostText('');
      setFeed((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, text: editingPostText } : p))
      );
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la modification de la publication.');
    }
  };

  const handleDeleteUserPost = async (postId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette publication ?')) return;
    try {
      await api.delete(`/api/posts/${postId}`);
      setFeed((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la suppression de la publication.');
    }
  };

  const fetchQuote = async () => {
    try {
      const res = await api.get('/api/quote');
      if (res.data && res.data.text) {
        setQuote(res.data.text);
      }
    } catch (error) { console.error(error); }
  };

  const handlePublishQuote = async (e) => {
    e.preventDefault();
    if (!adminNewQuote.trim()) return;
    try {
      await api.post('/api/quote', { text: adminNewQuote });
      setQuote(adminNewQuote);
      setAdminNewQuote('');
      alert('La citation du jour a été mise à jour avec succès !');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la mise à jour de la citation.');
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  useEffect(() => {
    if (user && view === 'feed') {
      fetchFeed(0, false);
      fetchQuote();
    }
  }, [user, view, fetchFeed]);

  const fetchContacts = async () => {
    try {
      if (!user) return;
      if (user.role === 'coach') {
        const res = await api.get(`/api/users/${user.id}/conversations`);
        setContacts(res.data);
      } else {
        const res = await api.get(`/api/users/${user.id}/coaches`);
        setContacts(res.data);
      }
    } catch (error) { console.error(error); }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/api/users/${user.id}/unread`);
      setTotalUnread(res.data.count);
    } catch (error) { console.error(error); }
  };

  const markAsRead = async (contactId) => {
    try {
      await api.post('/api/messages/read', { senderId: contactId });
      fetchContacts();
      fetchUnreadCount();
    } catch (error) { console.error(error); }
  };

  const fetchChatMessages = async (coachId) => {
    try {
      const res = await api.get(`/api/messages/${user.id}/${coachId}`);
      setChatMessages(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (user && view === 'messages') fetchContacts();
    if (user) fetchUnreadCount();
  }, [user, view]);

  // Polling for unread counts globally every 10s
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        if (view !== 'messages') fetchUnreadCount();
        if (view === 'messages') fetchContacts();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user, view]);

  useEffect(() => {
    if (selectedCoach && view === 'messages') {
      fetchChatMessages(selectedCoach.id);
      markAsRead(selectedCoach.id);
      const interval = setInterval(() => {
        fetchChatMessages(selectedCoach.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedCoach, view]);

  const handleReportPost = async (postId) => {
    try {
      await api.post(`/api/posts/${postId}/report`);
      alert("Merci pour votre signalement. Notre équipe de modération va examiner ce contenu.");
      fetchFeed();
    } catch (error) { console.error(error); }
  };

  const fetchReportedPosts = async () => {
    try {
      const res = await api.get('/api/admin/reported-posts');
      setReportedPosts(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchAdminMetrics = async () => {
    try {
      const res = await api.get('/api/admin/metrics');
      setAdminMetrics(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setAdminUsers(res.data);
    } catch (error) { console.error(error); }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      fetchAdminUsers();
      fetchAdminMetrics();
    } catch (error) { console.error(error); }
  };

  const handleApprovePost = async (postId) => {
    try {
      await api.post(`/api/admin/posts/${postId}/approve`);
      fetchReportedPosts();
    } catch (error) { console.error(error); }
  };

  const handleDeletePost = async (postId) => {
    try {
      if (confirm("Voulez-vous vraiment supprimer définitivement ce post ?")) {
        await api.delete(`/api/admin/posts/${postId}`);
        fetchReportedPosts();
        fetchAdminMetrics();
        fetchFeed();
      }
    } catch (error) { console.error(error); }
  };

  const handleGeneratePDF = () => {
    if (!adminMetrics) return;
    
    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    const htmlContent = `
      <html>
        <head>
          <title>Rever - Rapport d'Administration</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              padding: 50px;
              line-height: 1.6;
              background-color: #ffffff;
            }
            .header {
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 24px;
              margin-bottom: 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .logo {
              font-size: 26px;
              font-weight: 700;
              letter-spacing: 0.05em;
              color: #7c3aed;
              text-transform: uppercase;
            }
            .date {
              font-size: 13px;
              color: #64748b;
              font-weight: 500;
            }
            .title {
              font-size: 32px;
              font-weight: 300;
              margin-top: 0;
              margin-bottom: 8px;
              color: #0f172a;
              letter-spacing: -0.03em;
            }
            .subtitle {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 48px;
              font-weight: 300;
              max-width: 700px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #475569;
              margin-top: 48px;
              margin-bottom: 24px;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 8px;
            }
            .grid {
              display: grid;
              grid-template-cols: repeat(4, 1fr);
              gap: 24px;
              margin-bottom: 48px;
            }
            .card {
              border: 1px solid #e2e8f0;
              border-radius: 20px;
              padding: 24px;
              background-color: #f8fafc;
            }
            .card-title {
              font-size: 10px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 600;
              letter-spacing: 0.08em;
              margin: 0 0 10px 0;
            }
            .card-value {
              font-size: 36px;
              font-weight: 700;
              color: #0f172a;
              margin: 0;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 48px;
            }
            .table th {
              background-color: #f8fafc;
              padding: 14px 20px;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              font-weight: 600;
              color: #475569;
              text-align: left;
              border-bottom: 1px solid #e2e8f0;
            }
            .table td {
              padding: 16px 20px;
              font-size: 13px;
              border-bottom: 1px solid #f1f5f9;
              color: #334155;
            }
            .decision-box {
              background-color: #faf5ff;
              border: 1px dashed #d8b4fe;
              border-radius: 20px;
              padding: 30px;
              margin-top: 60px;
            }
            .decision-title {
              font-size: 13px;
              font-weight: 600;
              color: #6b21a8;
              margin-top: 0;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .decision-text {
              font-size: 13px;
              color: #581c87;
              margin: 0;
              line-height: 1.7;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Rever</div>
            <div class="date">${today}</div>
          </div>
          
          <h1 class="title">Rapport d'Administration et Décisions</h1>
          <p class="subtitle">Ce rapport consolide les métriques clés d'engagement de Rever pour guider la stratégie de modération et d'animation communautaire.</p>
          
          <div class="section-title">Mesures d'Engagement</div>
          <div class="grid">
            <div class="card">
              <p class="card-title">Membres Inscrits</p>
              <p class="card-value">${adminMetrics.totalUsers}</p>
            </div>
            <div class="card">
              <p class="card-title">Confessions</p>
              <p class="card-value">${adminMetrics.totalPosts}</p>
            </div>
            <div class="card">
              <p class="card-title">Commentaires</p>
              <p class="card-value">${adminMetrics.totalComments}</p>
            </div>
            <div class="card">
              <p class="card-title">Discussions</p>
              <p class="card-value">${adminMetrics.totalMessages}</p>
            </div>
          </div>
          
          <div class="section-title">Breakdown des Utilisateurs</div>
          <table class="table">
            <thead>
              <tr>
                <th>Type d'Utilisateur</th>
                <th>Membres</th>
                <th>Proportion</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>🌱 Membres de la communauté (Simple Users)</strong></td>
                <td>${adminMetrics.usersByRole?.user || 0}</td>
                <td>${Math.round(((adminMetrics.usersByRole?.user || 0) / adminMetrics.totalUsers) * 100)}%</td>
              </tr>
              <tr>
                <td><strong>🧘 Coachs Professionnels</strong></td>
                <td>${adminMetrics.usersByRole?.coach || 0}</td>
                <td>${Math.round(((adminMetrics.usersByRole?.coach || 0) / adminMetrics.totalUsers) * 100)}%</td>
              </tr>
              <tr>
                <td><strong>👑 Administrateurs</strong></td>
                <td>${adminMetrics.usersByRole?.admin || 0}</td>
                <td>${Math.round(((adminMetrics.usersByRole?.admin || 0) / adminMetrics.totalUsers) * 100)}%</td>
              </tr>
            </tbody>
          </table>
          
          <div class="section-title">Sécurité et Modération</div>
          <table class="table">
            <thead>
              <tr>
                <th>Indicateur</th>
                <th>Mesure</th>
                <th>Sévérité recommandée</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Publications Signalées actives</td>
                <td><strong>${reportedPosts.length} post(s) en attente</strong></td>
                <td>
                  <span style="background-color: ${reportedPosts.length > 0 ? '#ffe4e6' : '#d1fae5'}; color: ${reportedPosts.length > 0 ? '#9f1239' : '#065f46'}; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold;">
                    ${reportedPosts.length > 5 ? 'CRITIQUE' : reportedPosts.length > 0 ? 'MOYENNE' : 'SÛRE'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div class="decision-box">
            <h3 class="decision-title">💡 Recommandations de Pilotage</h3>
            <p class="decision-text">
              • <strong>Ratio Confessions/Membres</strong> : Actuellement à <strong>${(adminMetrics.totalPosts / adminMetrics.totalUsers).toFixed(1)}</strong>, traduisant une dynamique d'expression saine.<br/>
              • <strong>Encadrement Psychologique</strong> : Le ratio de membres par coach est de <strong>${adminMetrics.usersByRole?.coach ? Math.round(adminMetrics.totalUsers / adminMetrics.usersByRole.coach) : adminMetrics.totalUsers}:1</strong>. Idéalement, ce ratio devrait se maintenir sous 30:1 pour assurer des réponses qualitatives et rapides aux membres en souffrance.<br/>
              • <strong>Modération active</strong> : Résoudre en priorité les <strong>${reportedPosts.length} signalements</strong> restants sur la plateforme pour préserver la bienveillance du flux.
            </p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  useEffect(() => {
    if (user && user.role === 'admin' && view === 'admin-dashboard') {
      fetchReportedPosts();
      fetchAdminMetrics();
      fetchAdminUsers();
    }
  }, [user, view]);

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !selectedCoach) return;
    try {
      await api.post('/api/messages', {
        receiverId: selectedCoach.id,
        text: newChatMessage
      });
      setNewChatMessage('');
      fetchChatMessages(selectedCoach.id);
    } catch (error) { console.error(error); }
  };

  if (showContact && !user) {
    return <ContactPage onBack={() => setShowContact(false)} onGetStarted={() => { setShowContact(false); setShowLanding(false); }} theme={theme} toggleTheme={toggleTheme} />;
  }

  if (showLanding && !user) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} onContact={() => setShowContact(true)} theme={theme} toggleTheme={toggleTheme} />;
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 text-slate-800 dark:text-slate-300 font-sans relative overflow-hidden transition-colors duration-500 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="w-full max-w-sm sm:max-w-md bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-purple-500/10 z-10 relative animate-[slideUp_0.8s_ease-out_both] hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-1">
          <div className="flex justify-end mb-2">
            <button onClick={toggleTheme} className="text-xl sm:text-2xl hover:scale-110 transition-transform">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extralight tracking-widest text-slate-900 dark:text-slate-200 mb-2 text-center uppercase">Anonyme Pro</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 text-center uppercase tracking-widest">
            {view === 'login' ? 'Connexion' : 'Inscription'}
          </p>

          {authError && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500/50 rounded-xl text-red-600 dark:text-red-200 text-xs text-center backdrop-blur-sm">{authError}</div>}

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-3 sm:gap-4">
              <input 
                type="text" placeholder="Pseudo, Email ou Numéro" required
                className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-base md:text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                value={authForm.loginId} onChange={(e) => setAuthForm({...authForm, loginId: e.target.value})}
              />
              <input 
                type="password" placeholder="Mot de passe" required
                className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-base md:text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              />
              <button className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_200%] hover:bg-[length:100%_100%] text-white font-bold rounded-xl mt-2 transition-all uppercase text-xs tracking-wider shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5">
                Se connecter
              </button>
              <p className="text-xs text-center text-slate-600 dark:text-slate-400 mt-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => setView('register')}>
                Pas encore de compte ? S'inscrire
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-3 sm:gap-4">
              <div className="flex gap-3 sm:gap-4">
                <input type="text" placeholder="Prénom" required className="w-1/2 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-base md:text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                  value={authForm.firstName} onChange={(e) => setAuthForm({...authForm, firstName: e.target.value})} />
                <input type="text" placeholder="Nom" required className="w-1/2 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-base md:text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                  value={authForm.lastName} onChange={(e) => setAuthForm({...authForm, lastName: e.target.value})} />
              </div>
              <input type="text" placeholder="Email ou Numéro" required className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-base md:text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                value={authForm.contact} onChange={(e) => setAuthForm({...authForm, contact: e.target.value})} />
              <input type="text" placeholder="Pseudo (Public)" required className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-base md:text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                value={authForm.pseudo} onChange={(e) => setAuthForm({...authForm, pseudo: e.target.value})} />
              <input type="password" placeholder="Mot de passe (8 car. min.)" required minLength={8} className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-base md:text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} />
              <button className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_200%] hover:bg-[length:100%_100%] text-white font-bold rounded-xl mt-2 transition-all uppercase text-xs tracking-wider shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5">
                Créer mon compte
              </button>
              <p className="text-xs text-center text-slate-600 dark:text-slate-400 mt-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => setView('login')}>
                Déjà un compte ? Se connecter
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-300 font-sans relative overflow-x-hidden transition-colors duration-500 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <nav className="w-full border-b border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex justify-between items-center">
          <h1 className="text-lg sm:text-xl font-light tracking-widest text-slate-900 dark:text-slate-200 uppercase">Anonyme Pro</h1>
          
          <div className="flex gap-3 sm:gap-4 md:gap-8 text-[10px] sm:text-xs md:text-sm uppercase tracking-wider font-medium">
            <button onClick={() => setView('feed')} className={`${view === 'feed' ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'} transition-colors`}>Feed</button>
            {(user.role === 'user' || user.role === 'coach') && (
              <button onClick={() => setView('messages')} className={`relative ${view === 'messages' ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'} transition-colors`}>
                Messages
                {totalUnread > 0 && (
                  <span className="absolute -top-2 -right-3 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-md">
                    {totalUnread}
                  </span>
                )}
              </button>
            )}
            {user.role === 'admin' && (
              <button onClick={() => setView('admin-dashboard')} className={`${view === 'admin-dashboard' ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'} transition-colors`}>Admin</button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleTheme} className="text-sm sm:text-lg hover:scale-110 transition-transform">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-3 sm:px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.05)] dark:shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:scale-105 cursor-default flex items-center gap-1.5">
                <span className="animate-bounce inline-block" style={{ animationDuration: '2s' }}>{user.role === 'admin' ? '👑' : user.role === 'coach' ? '🧘' : `🌱`}</span>
                <span className="hidden sm:inline font-medium tracking-wide"> {user.role === 'admin' ? 'Admin' : user.role === 'coach' ? 'Coach' : user.pseudo}</span>
              </span>
            </div>
            <button onClick={handleLogout} className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400" aria-label="Déconnexion">🚪</button>
            {user.role !== 'admin' && (
              <div className="hidden md:flex items-center gap-2">
                <button type="button" onClick={exportData} className="text-[10px] text-slate-500 hover:text-purple-600 font-medium" title="Exporter mes données (RGPD)">Export</button>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Supprimer définitivement votre compte et toutes vos données ?')) {
                      await deleteAccount();
                      setView('login');
                    }
                  }}
                  className="text-[10px] text-slate-500 hover:text-rose-500 font-medium"
                  title="Supprimer mon compte"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className={`${view === 'admin-dashboard' ? 'max-w-7xl' : 'max-w-3xl'} mx-auto p-4 sm:p-6 pt-6 sm:pt-8 transition-all duration-300`}>
        
        {view === 'feed' && (
          <div className="relative z-10">
            {/* Daily Quote / Motivation Banner */}
            {quote && (
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border border-purple-200/50 dark:border-purple-500/30 rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-all duration-500 animate-[fadeIn_0.8s_ease-out] group">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-purple-500/20 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    ✨
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs sm:text-sm font-bold tracking-widest text-purple-600 dark:text-purple-300 uppercase mb-2">
                      Motivation du jour
                    </h3>
                    <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 font-light leading-relaxed italic">
                      "{quote}"
                    </p>
                    
                    {/* Share Actions Bar */}
                    <div className="flex flex-wrap gap-2.5 mt-5 items-center">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 mr-1.5 flex items-center gap-1">
                        <span>📤</span> Partager :
                      </span>
                      
                      {/* WhatsApp Button */}
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `🧘 *Motivation du jour sur Rever* :\n\n"${quote}"\n\nRejoignez-nous en toute confidentialité sur https://annonyme.pro ✨`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-sm active:scale-95"
                      >
                        <span className="text-xs sm:text-sm">💬</span> WhatsApp
                      </a>
                      
                      {/* Instagram Share / Copy Button */}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`🧘 Motivation du jour sur Rever :\n\n"${quote}"\n\nRejoignez-nous en toute confidentialité sur https://annonyme.pro ✨`);
                          setQuoteCopied(true);
                          setTimeout(() => setQuoteCopied(false), 2000);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 dark:border-pink-500/30 text-pink-600 dark:text-pink-400 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-sm active:scale-95"
                      >
                        <span className="text-xs sm:text-sm">{quoteCopied ? '✅' : '📸'}</span>
                        {quoteCopied ? 'Copié !' : 'Instagram'}
                      </button>

                      {/* Native Smart Share (Visible only on mobile devices that support navigator.share) */}
                      {typeof navigator !== 'undefined' && navigator.share && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.share({
                              title: 'Motivation du jour - Rever',
                              text: `🧘 Motivation du jour : "${quote}"`,
                              url: 'https://annonyme.pro'
                            }).catch((err) => console.log('Share canceled', err));
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-sm active:scale-95"
                        >
                          <span className="text-xs sm:text-sm">🔗</span> Plus...
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-3xl p-5 sm:p-7 mb-8 sm:mb-10 shadow-lg shadow-purple-500/5 animate-[slideUp_0.6s_ease-out_both] hover:shadow-purple-500/10 transition-shadow duration-500">
              <form onSubmit={handleCreatePost}>
                <textarea 
                  value={newPostText} onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Partagez vos pensées..."
                  className="w-full h-20 sm:h-24 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 text-base md:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                />
                {newPostImagePreview && (
                  <div className="mt-3 sm:mt-4 relative">
                    <img src={newPostImagePreview} alt="Preview" className="w-full max-h-48 sm:max-h-64 object-cover rounded-xl shadow-md" />
                    <button 
                      type="button" 
                      onClick={() => { setNewPostImage(null); setNewPostImagePreview(null); }}
                      className="absolute top-3 right-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur text-slate-900 dark:text-white rounded-full p-2 hover:bg-rose-500 hover:text-white transition-colors text-xs shadow-sm"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-3">
                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-all hover:shadow-md">
                      📷 Ajouter une image
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    
                    {/* Toggle Anonyme */}
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 ${
                        isAnonymous 
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20' 
                          : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700/50 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-sm">{isAnonymous ? '🔒' : '🔓'}</span>
                      {isAnonymous ? 'Anonyme' : 'Public'}
                    </button>
                  </div>
                  <button type="submit" disabled={!newPostText.trim()} className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_200%] hover:bg-[length:100%_100%] text-white rounded-xl text-xs sm:text-sm uppercase font-bold tracking-wide disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5">
                    Publier
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {feed.map((post, index) => (
                <div 
                  key={post.id} 
                  className="bg-white/80 dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-slate-700/40 rounded-3xl p-5 sm:p-7 shadow-lg hover:border-purple-300 dark:hover:border-purple-500/40 transition-all duration-500 hover:shadow-purple-500/15 hover:-translate-y-1 animate-[slideUp_0.6s_ease-out_both]"
                  style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-300">{post.username}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-600">{new Date(post.created_at).toLocaleString('fr-FR')}</p>
                      </div>
                    </div>
                    {post.user_id === user.id && (
                      <div className="flex gap-2 text-xs">
                        <button 
                          onClick={() => { setEditingPostId(post.id); setEditingPostText(post.text); }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors font-medium flex items-center gap-1"
                        >
                          ✏️ Modifier
                        </button>
                        <button 
                          onClick={() => handleDeleteUserPost(post.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg transition-colors font-medium flex items-center gap-1"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                  {editingPostId === post.id ? (
                    <div className="mb-4 space-y-3">
                      <textarea
                        value={editingPostText}
                        onChange={(e) => setEditingPostText(e.target.value)}
                        className="w-full h-24 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdatePost(post.id)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => { setEditingPostId(null); setEditingPostText(''); }}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-700 dark:text-slate-300 mb-3 sm:mb-4 font-light whitespace-pre-wrap text-sm">{post.text}</p>
                  )}
                  {post.image_url && (
                    <div className="mb-3 sm:mb-4">
                      <img src={getFullImageUrl(post.image_url)} alt="Publication" loading="lazy" className="w-full max-h-64 sm:max-h-96 object-cover rounded-xl" />
                    </div>
                  )}
                  <div className="flex items-center gap-4 sm:gap-6 mb-3 sm:mb-4 border-t border-slate-200 dark:border-slate-800 pt-3 sm:pt-4">
                    <button 
                      onClick={() => handleLike(post.id)} 
                      disabled={post.liked_by_me}
                      className={`flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm ${post.liked_by_me ? 'text-rose-500 opacity-70 cursor-default' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400'}`}
                      aria-label={post.liked_by_me ? 'Déjà aimé' : 'Aimer'}
                    >
                      ❤️ {post.likes}
                    </button>
                    <span className="flex items-center gap-1 sm:gap-2 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                      💬 {post.comments?.length || 0}
                    </span>
                    {user.role === 'admin' ? (
                      <button 
                        onClick={() => handleDeletePost(post.id)} 
                        className="flex items-center gap-1 sm:gap-2 text-rose-500 hover:text-rose-600 transition-colors text-[10px] sm:text-xs ml-auto uppercase tracking-wider font-bold"
                        title="Supprimer ce post définitivement"
                      >
                        🗑️ Supprimer
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleReportPost(post.id)} 
                        className="flex items-center gap-1 sm:gap-2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors text-[10px] sm:text-xs ml-auto uppercase tracking-wider font-semibold"
                        title="Signaler ce post"
                      >
                        ⚠️ Signaler
                      </button>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700/50 pt-4 sm:pt-5">
                    {post.comments?.map(comment => (
                      <div key={comment.id} className="mb-3 sm:mb-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/30 rounded-2xl">
                        <p className="text-[10px] sm:text-xs font-semibold text-purple-600 dark:text-purple-300 mb-1">{comment.username}</p>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{comment.text}</p>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-3 sm:mt-4">
                      <input 
                        type="text" 
                        placeholder="Écrire un commentaire..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-2.5 sm:p-3 text-base md:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                      />
                      <button 
                        onClick={() => handleComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl text-xs sm:text-sm disabled:opacity-50 transition-all shadow-md hover:shadow-purple-500/20"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {feedHasMore && (
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => fetchFeed(feedOffset, true)}
                    disabled={feedLoading}
                    className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    {feedLoading ? 'Chargement…' : 'Charger plus'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'messages' && (
          <div className="relative z-10 flex flex-col md:flex-row gap-6 animate-[fadeIn_0.4s_ease-out]">
            {/* Coaches List */}
            <div className={`w-full md:w-1/3 bg-white/80 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-3xl p-4 shadow-lg h-[500px] md:h-[600px] overflow-y-auto ${selectedCoach ? 'hidden md:block' : 'block'}`}>
              <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100 px-2">{user.role === 'coach' ? 'Discussions' : 'Coachs'}</h2>
              {contacts.length > 0 ? contacts.map(coach => (
                <div 
                  key={coach.id} 
                  onClick={() => setSelectedCoach(coach)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all mb-2 flex items-center gap-3 ${selectedCoach?.id === coach.id ? 'bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/40 border border-transparent'}`}
                >
                  <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold relative">
                    {coach.pseudo.charAt(0).toUpperCase()}
                    {parseInt(coach.unread_count) > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                    )}
                  </div>
                  <div className="truncate flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{coach.pseudo}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.role === 'coach' ? 'Utilisateur' : 'Professionnel'}</p>
                  </div>
                  {parseInt(coach.unread_count) > 0 && (
                    <div className="bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0 shadow-sm animate-pulse">
                      {coach.unread_count}
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-sm text-slate-500 px-2">Aucun coach disponible.</p>
              )}
            </div>

            {/* Chat Area */}
            <div className={`w-full md:w-2/3 bg-white/80 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-3xl flex flex-col shadow-lg h-[500px] md:h-[600px] overflow-hidden ${selectedCoach ? 'flex' : 'hidden md:flex'}`}>
              {selectedCoach ? (
                <>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => setSelectedCoach(null)} 
                      className="md:hidden p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-500 hover:text-slate-850 dark:hover:text-slate-200 transition-colors"
                      title="Retour"
                    >
                      ⬅️
                    </button>
                    <div className="w-8 h-8 shrink-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {selectedCoach.pseudo.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Discussion avec {selectedCoach.pseudo}</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse font-sans">
                    <div className="flex flex-col gap-4">
                      {chatMessages.map(msg => {
                        const isMe = msg.sender_id === user.id;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl ${isMe ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-sm animate-[slideUp_0.2s_ease-out]' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-600/50 animate-[slideUp_0.2s_ease-out]'}`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                              <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30 flex gap-2">
                    <input 
                      type="text" 
                      value={newChatMessage} 
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder="Votre message..."
                      className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 text-base md:text-sm outline-none focus:border-purple-500 text-slate-900 dark:text-slate-100 shadow-sm"
                    />
                    <button type="submit" disabled={!newChatMessage.trim()} className="px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl disabled:opacity-50 transition-all hover:scale-105 shadow-md">
                      Envoyer
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-6 text-center">
                  <div className="text-5xl mb-4 opacity-50 animate-bounce" style={{ animationDuration: '3s' }}>💬</div>
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Vos messages privés</h3>
                  <p className="text-sm">Sélectionnez un coach dans la liste pour commencer une discussion en toute confidentialité.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'admin-dashboard' && (
          <div className="animate-[fadeIn_0.4s_ease-out] relative z-10 flex flex-col lg:flex-row gap-8 items-start max-w-7xl mx-auto w-full px-4 py-6">
            
            {/* LEFT SIDEBAR NAVIGATION */}
            <aside className="w-full lg:w-64 shrink-0 bg-white/60 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/30 rounded-3xl p-4 lg:p-6 shadow-sm space-y-4 lg:space-y-8 lg:sticky lg:top-24 lg:self-start">
              <div className="flex items-center justify-between lg:justify-start lg:gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-md">
                    👑
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-widest text-slate-900 dark:text-slate-100 uppercase">Rever Admin</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-light">Console de contrôle</p>
                  </div>
                </div>
                {/* Live Status indicator on mobile */}
                <div className="lg:hidden flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
                </div>
              </div>

              {/* Heartbeat Status Indicator (hidden on mobile, shown on lg) */}
              <div className="hidden lg:flex bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 rounded-2xl p-4 items-center gap-3 shadow-inner">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
                <div>
                  <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Platform Live</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-light">Connexion sécurisée SSL</p>
                </div>
              </div>

              {/* Navigation Tabs (scrollable row on mobile, column on lg) */}
              <nav className="flex flex-row overflow-x-auto lg:flex-col gap-2 pb-2 lg:pb-0 scrollbar-none">
                <button 
                  onClick={() => setAdminTab('metrics')}
                  className={`whitespace-nowrap px-4 py-2.5 lg:py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 lg:gap-3 ${adminTab === 'metrics' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40'}`}
                >
                  <span>📊</span> Métriques
                </button>
                <button 
                  onClick={() => setAdminTab('users')}
                  className={`whitespace-nowrap px-4 py-2.5 lg:py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 lg:gap-3 ${adminTab === 'users' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40'}`}
                >
                  <span>👥</span> Comptes
                </button>
                <button 
                  onClick={() => setAdminTab('moderation')}
                  className={`whitespace-nowrap px-4 py-2.5 lg:py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 lg:gap-3 ${adminTab === 'moderation' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40'}`}
                >
                  <span>🚨</span> Modération {reportedPosts.length > 0 && <span className="px-1.5 py-0.5 text-[9px] bg-rose-500 text-white rounded-full ml-1">{reportedPosts.length}</span>}
                </button>
                <button 
                  onClick={() => setAdminTab('quote')}
                  className={`whitespace-nowrap px-4 py-2.5 lg:py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 lg:gap-3 ${adminTab === 'quote' ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40'}`}
                >
                  <span>✨</span> Citation
                </button>
              </nav>

              {/* Admin profile detail (hidden on mobile, shown on lg) */}
              <div className="hidden lg:flex pt-4 border-t border-slate-100 dark:border-slate-800/40 items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-base">
                  👑
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{user.pseudo}</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">Super Admin</p>
                </div>
              </div>
            </aside>

            {/* RIGHT MAIN WORKSPACE */}
            <div className="flex-1 w-full space-y-10">
              <div className="bg-white/40 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/30 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-slate-900 dark:text-slate-200">
                    {adminTab === 'metrics' && "📊 Métriques & Analytics"}
                    {adminTab === 'users' && "👥 Gestion des Comptes"}
                    {adminTab === 'moderation' && "🚨 Centre de Modération"}
                    {adminTab === 'quote' && "✨ Citation du Jour"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-1">
                    {adminTab === 'metrics' && "Indicateurs d'engagement de la plateforme en temps réel."}
                    {adminTab === 'users' && "Contrôle des privilèges et rôles des membres de la communauté."}
                    {adminTab === 'moderation' && "Suivi des publications signalées par les membres."}
                    {adminTab === 'quote' && "Publiez une motivation inspirante quotidienne pour tous les utilisateurs."}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleGeneratePDF}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_200%] hover:bg-[length:100%_100%] text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.02] flex items-center gap-2"
                  >
                    📄 Exporter Rapport PDF
                  </button>
                </div>
              </div>
              
              {/* TAB CONTENT: METRICS */}
              {adminTab === 'metrics' && (
                <div className="space-y-10 animate-[slideUp_0.4s_ease-out]">
                  {adminMetrics ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white/40 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/30 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-4xl">👥</span>
                            <span className="text-[10px] font-bold px-3 py-1 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-full tracking-wider uppercase">Membres</span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Utilisateurs</h4>
                          <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-3">{adminMetrics.totalUsers}</p>
                          <div className="flex flex-col gap-2 mt-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/40 pt-4 font-light">
                            <div className="flex justify-between"><span>🌱 Users:</span> <strong>{adminMetrics.usersByRole?.user || 0}</strong></div>
                            <div className="flex justify-between"><span>🧘 Coachs:</span> <strong>{adminMetrics.usersByRole?.coach || 0}</strong></div>
                            <div className="flex justify-between"><span>👑 Admins:</span> <strong>{adminMetrics.usersByRole?.admin || 0}</strong></div>
                          </div>
                        </div>

                        <div className="bg-white/40 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/30 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-4xl">📝</span>
                            <span className="text-[10px] font-bold px-3 py-1 bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full tracking-wider uppercase">Contenu</span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Confessions</h4>
                          <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-3">{adminMetrics.totalPosts}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-6 border-t border-slate-100 dark:border-slate-800/40 pt-4 font-light leading-relaxed">
                            L'activité globale traduit le besoin d'expression des confessions anonymes.
                          </p>
                        </div>

                        <div className="bg-white/40 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/30 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-4xl">💬</span>
                            <span className="text-[10px] font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-full tracking-wider uppercase">Commentaires</span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Réponses</h4>
                          <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-3">{adminMetrics.totalComments}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-6 border-t border-slate-100 dark:border-slate-800/40 pt-4 font-light leading-relaxed">
                            Taux d'échange et d'entraide active sur le feed public de l'application.
                          </p>
                        </div>

                        <div className="bg-white/40 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/30 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-4xl">✉️</span>
                            <span className="text-[10px] font-bold px-3 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-full tracking-wider uppercase">Messages</span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Discussions</h4>
                          <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-3">{adminMetrics.totalMessages}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-6 border-t border-slate-100 dark:border-slate-800/40 pt-4 font-light leading-relaxed">
                            Nombre total d'échanges privés ultra-confidentiels entre les coachs et les membres.
                          </p>
                        </div>
                      </div>
                      
                      {/* Stacked Horizontal Progress Bar Chart */}
                      <div className="bg-white/40 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/30 rounded-3xl p-8 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Répartition Graphique des Rôles</h4>
                          <span className="text-[10px] text-slate-400 font-light">Calculé en temps réel</span>
                        </div>
                        
                        {(() => {
                          const total = adminMetrics.totalUsers || 1;
                          const usersCount = adminMetrics.usersByRole?.user || 0;
                          const coachesCount = adminMetrics.usersByRole?.coach || 0;
                          const adminsCount = adminMetrics.usersByRole?.admin || 0;
                          
                          const usersPct = Math.round((usersCount / total) * 100);
                          const coachesPct = Math.round((coachesCount / total) * 100);
                          const adminsPct = Math.round((adminsCount / total) * 100);
                          
                          return (
                            <div className="space-y-6">
                              <div className="h-4 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                                <div style={{ width: `${usersPct}%` }} className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000" title={`Membres: ${usersPct}%`} />
                                <div style={{ width: `${coachesPct}%` }} className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000" title={`Coachs: ${coachesPct}%`} />
                                <div style={{ width: `${adminsPct}%` }} className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-1000" title={`Admins: ${adminsPct}%`} />
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-3.5 h-3.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500" />
                                  <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">Membres ({usersPct}%)</p>
                                    <p className="text-[10px] text-slate-400 font-light">{usersCount} inscrits</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  <span className="w-3.5 h-3.5 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500" />
                                  <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">Coachs ({coachesPct}%)</p>
                                    <p className="text-[10px] text-slate-400 font-light">{coachesCount} certifiés</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  <span className="w-3.5 h-3.5 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500" />
                                  <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">Admins ({adminsPct}%)</p>
                                    <p className="text-[10px] text-slate-400 font-light">{adminsCount} superviseurs</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      
                      <div className="bg-white/50 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/30 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
                        <div className="space-y-1">
                          <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200">État général de la modération</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
                            {reportedPosts.length > 0 
                              ? `Il y a actuellement ${reportedPosts.length} publication(s) suspectes ou signalées en attente de traitement.` 
                              : "La plateforme est sereine. Aucun contenu n'a été signalé par la communauté."}
                          </p>
                        </div>
                        <button 
                          onClick={() => setAdminTab('moderation')}
                          className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-md ${reportedPosts.length > 0 ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200'}`}
                        >
                          {reportedPosts.length > 0 ? "🚀 Modérer les signalements" : "Consulter l'historique"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-16 text-slate-400 font-light">Récupération des indicateurs en cours...</div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: USERS MANAGEMENT */}
              {adminTab === 'users' && (
                <div className="bg-white/40 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/30 rounded-3xl p-8 shadow-sm space-y-8 animate-[slideUp_0.4s_ease-out]">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                    <h3 className="text-xl font-light text-slate-800 dark:text-slate-200">
                      Membres inscrits <span className="text-xs text-purple-600 font-bold ml-2">({adminUsers.length})</span>
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      {/* Search Input */}
                      <div className="relative flex-1 sm:w-64">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs opacity-60">🔍</span>
                        <input 
                          type="text"
                          placeholder="Rechercher pseudo, prénom, contact..."
                          value={adminSearch}
                          onChange={(e) => setAdminSearch(e.target.value)}
                          className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-light text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      
                      {/* Role Filter Selector */}
                      <select
                        value={adminRoleFilter}
                        onChange={(e) => setAdminRoleFilter(e.target.value)}
                        className="bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-700 dark:text-slate-300 transition-all cursor-pointer font-semibold shadow-sm hover:border-purple-500/50"
                      >
                        <option value="all">🌐 Tous les rôles</option>
                        <option value="user">🌱 Simple User</option>
                        <option value="coach">🧘 Professional Coach</option>
                        <option value="admin">👑 Administrator</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800/60 text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                          <th className="py-4 px-6">Identité</th>
                          <th className="py-4 px-6">Pseudo</th>
                          <th className="py-4 px-6">Contact unique</th>
                          <th className="py-4 px-6">Statut / Rôle</th>
                          <th className="py-4 px-6 text-right">Rôle administratif</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
                        {adminUsers.filter(u => {
                          const matchesSearch = 
                            (u.pseudo || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
                            (u.first_name || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
                            (u.last_name || '').toLowerCase().includes(adminSearch.toLowerCase()) ||
                            (u.contact || '').toLowerCase().includes(adminSearch.toLowerCase());
                          const matchesRole = adminRoleFilter === 'all' || u.role === adminRoleFilter;
                          return matchesSearch && matchesRole;
                        }).map(u => (
                          <tr key={u.id} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{u.role === 'admin' ? '👑' : u.role === 'coach' ? '🧘' : '🌱'}</span>
                                <span className="font-semibold">{u.first_name} {u.last_name}</span>
                              </div>
                            </td>
                            <td className="py-5 px-6 font-mono text-xs text-slate-500">{u.pseudo}</td>
                            <td className="py-5 px-6 text-xs text-slate-400 dark:text-slate-500">{u.contact}</td>
                            <td className="py-5 px-6">
                              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'admin' 
                                  ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300' 
                                  : u.role === 'coach' 
                                    ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-5 px-6 text-right">
                              {u.id !== user.id ? (
                                <select 
                                  value={u.role}
                                  onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                  className="bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-700 dark:text-slate-300 transition-all duration-300 cursor-pointer font-semibold shadow-sm hover:border-purple-500/50"
                                >
                                  <option value="user">🌱 Simple User</option>
                                  <option value="coach">🧘 Professional Coach</option>
                                  <option value="admin">👑 Administrator</option>
                                </select>
                              ) : (
                                <span className="text-xs text-slate-400 dark:text-slate-600 font-semibold italic">Vous-même</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: MODERATION */}
              {adminTab === 'moderation' && (
                <div className="bg-white/40 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/30 rounded-3xl p-8 shadow-sm space-y-8 animate-[slideUp_0.4s_ease-out]">
                  <h3 className="text-xl font-light text-slate-800 dark:text-slate-200">
                    Publications signalées par la communauté <span className="text-xs text-rose-500 font-bold ml-2">({reportedPosts.length})</span>
                  </h3>
                  
                  {reportedPosts.length > 0 ? (
                    <div className="space-y-6">
                      {reportedPosts.map(post => (
                        <div key={post.id} className="p-6 bg-rose-50/10 dark:bg-rose-950/5 border border-rose-200/40 dark:border-rose-900/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all hover:shadow-md hover:border-rose-500/30 dark:hover:border-rose-500/20 shadow-sm animate-[fadeIn_0.3s_ease-out]">
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{post.username}</span>
                              <span className="text-[10px] text-slate-400">{new Date(post.created_at).toLocaleString('fr-FR')}</span>
                              <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px] px-3 py-1 rounded-full font-bold">
                                ⚠️ {post.reports_count} signalement(s)
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-light leading-relaxed">{post.text}</p>
                            {post.image_url && (
                              <div className="mt-3">
                                <img src={getFullImageUrl(post.image_url)} alt="Reported image" className="max-h-48 rounded-xl object-cover" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex md:flex-col lg:flex-row gap-3 shrink-0 w-full md:w-auto">
                            <button 
                              onClick={() => handleApprovePost(post.id)}
                              className="flex-1 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/30"
                            >
                              ✓ Approuver
                            </button>
                            <button 
                              onClick={() => handleDeletePost(post.id)}
                              className="flex-1 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/10 hover:shadow-rose-500/30"
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                      <div className="text-5xl mb-4 opacity-40">🛡️</div>
                      <p className="text-sm font-light">Aucun contenu n'a été signalé. La communauté est saine et bienveillante !</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: QUOTE OF THE DAY */}
              {adminTab === 'quote' && (
                <div className="bg-white/40 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/30 rounded-3xl p-8 shadow-sm space-y-8 animate-[slideUp_0.4s_ease-out]">
                  <h3 className="text-xl font-light text-slate-800 dark:text-slate-200">
                    Publier la Citation / Motivation du Jour
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Input Form */}
                    <div className="lg:col-span-7 bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/30 rounded-2xl p-6 shadow-inner space-y-4">
                      <form onSubmit={handlePublishQuote} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                            Texte de la citation
                          </label>
                          <textarea
                            value={adminNewQuote}
                            onChange={(e) => setAdminNewQuote(e.target.value)}
                            placeholder="Entrez une citation inspirante ou un message de motivation..."
                            rows="4"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-purple-500/25"
                        >
                          🚀 Publier pour tous les utilisateurs
                        </button>
                      </form>
                    </div>

                    {/* Right: Real-time Live Preview */}
                    <div className="lg:col-span-5 space-y-4">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Aperçu en direct
                      </h4>
                      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border border-purple-200/50 dark:border-purple-500/30 rounded-3xl p-6 shadow-xl shadow-purple-500/5">
                        <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-md">
                            ✨
                          </div>
                          <div>
                            <h3 className="text-[10px] font-bold tracking-widest text-purple-600 dark:text-purple-300 uppercase mb-1">
                              Motivation du jour
                            </h3>
                            <p className="text-sm text-slate-800 dark:text-slate-200 font-light leading-relaxed italic">
                              "{adminNewQuote.trim() || quote || "Votre texte de motivation s'affichera ici..."}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      <footer className="w-full py-8 mt-12 border-t border-slate-200/60 dark:border-slate-800/40 bg-white/40 dark:bg-slate-950/20 backdrop-blur-sm text-center text-xs text-slate-400 dark:text-slate-600 space-y-3 relative z-10 font-sans">
        <p className="font-light">© {new Date().getFullYear()} Anonyme Pro. Tous droits réservés.</p>
        {user && user.role !== 'admin' && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-[10px] uppercase tracking-wider font-semibold">
            <button type="button" onClick={exportData} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">📦 Exporter mes données (RGPD)</button>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Supprimer définitivement votre compte et toutes vos données ?')) {
                  await deleteAccount();
                  setView('login');
                }
              }}
              className="hover:text-rose-500 transition-colors"
            >
              🗑️ Supprimer mon compte
            </button>
          </div>
        )}
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none !important;
        }
        .scrollbar-none {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
    </div>
  );
}

export default App;
