import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LandingPage from './LandingPage';
import ContactPage from './ContactPage';

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    
    const hour = new Date().getHours();
    return (hour >= 19 || hour < 7) ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) setTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const [showLanding, setShowLanding] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rever_user');
    return saved ? JSON.parse(saved) : null;
  });
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
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [newPostImagePreview, setNewPostImagePreview] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post('http://localhost:5001/api/register', authForm);
      const userData = res.data;
      setUser(userData);
      localStorage.setItem('rever_user', JSON.stringify(userData));
      setView('feed');
    } catch (err) {
      setAuthError(err.response?.data?.error || "Erreur lors de l'inscription");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post('http://localhost:5001/api/login', { 
        login: authForm.loginId, password: authForm.password 
      });
      const userData = res.data;
      setUser(userData);
      localStorage.setItem('rever_user', JSON.stringify(userData));
      setView(userData.role === 'admin' ? 'admin-dashboard' : 'feed');
    } catch (err) {
      setAuthError(err.response?.data?.error || "Identifiants incorrects");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rever_user');
    setView('login');
    setAuthForm({ firstName: '', lastName: '', contact: '', password: '', pseudo: '', loginId: '' });
  };

  const fetchFeed = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/posts');
      setFeed(res.data);
    } catch (error) { console.error(error); }
  };

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
    formData.append('userId', user.id);
    formData.append('text', newPostText);
    if (newPostImage) {
      formData.append('image', newPostImage);
    }
    
    await axios.post('http://localhost:5001/api/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    setNewPostText('');
    setNewPostImage(null);
    setNewPostImagePreview(null);
    fetchFeed();
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`http://localhost:5001/api/posts/${postId}/like`);
      fetchFeed();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentInputChange = (postId, text) => {
    setCommentInputs({ ...commentInputs, [postId]: text });
  };

  const handleComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    
    try {
      await axios.post(`http://localhost:5001/api/posts/${postId}/comment`, { 
        userId: user.id, 
        text: text 
      });
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchFeed();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user && view === 'feed') fetchFeed();
  }, [user, view]);

  if (showContact && !user) {
    return <ContactPage onBack={() => setShowContact(false)} onGetStarted={() => { setShowContact(false); setShowLanding(false); }} theme={theme} toggleTheme={toggleTheme} />;
  }

  if (showLanding && !user) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} onContact={() => setShowContact(true)} theme={theme} toggleTheme={toggleTheme} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 text-slate-800 dark:text-slate-300 font-sans relative overflow-hidden transition-colors duration-500">
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
                className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                value={authForm.loginId} onChange={(e) => setAuthForm({...authForm, loginId: e.target.value})}
              />
              <input 
                type="password" placeholder="Mot de passe" required
                className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
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
                <input type="text" placeholder="Prénom" required className="w-1/2 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                  value={authForm.firstName} onChange={(e) => setAuthForm({...authForm, firstName: e.target.value})} />
                <input type="text" placeholder="Nom" required className="w-1/2 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                  value={authForm.lastName} onChange={(e) => setAuthForm({...authForm, lastName: e.target.value})} />
              </div>
              <input type="text" placeholder="Email ou Numéro" required className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                value={authForm.contact} onChange={(e) => setAuthForm({...authForm, contact: e.target.value})} />
              <input type="text" placeholder="Pseudo (Public)" required className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
                value={authForm.pseudo} onChange={(e) => setAuthForm({...authForm, pseudo: e.target.value})} />
              <input type="password" placeholder="Mot de passe" required className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-300 font-sans relative overflow-x-hidden transition-colors duration-500">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <nav className="w-full border-b border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex justify-between items-center">
          <h1 className="text-lg sm:text-xl font-light tracking-widest text-slate-900 dark:text-slate-200 uppercase">Anonyme Pro</h1>
          
          <div className="flex gap-3 sm:gap-4 md:gap-8 text-[10px] sm:text-xs md:text-sm uppercase tracking-wider font-medium">
            {user.role === 'user' || user.role === 'coach' ? (
              <>
                <button onClick={() => setView('feed')} className={`${view === 'feed' ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'} transition-colors`}>Feed</button>
              </>
            ) : (
              <>
                <button onClick={() => setView('admin-dashboard')} className={`${view === 'admin-dashboard' ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-400'} transition-colors`}>Admin</button>
              </>
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
            <button onClick={logout} className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400">🚪</button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-4 sm:p-6 pt-6 sm:pt-8">
        
        {view === 'feed' && (
          <div className="relative z-10">
            <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-3xl p-5 sm:p-7 mb-8 sm:mb-10 shadow-lg shadow-purple-500/5 animate-[slideUp_0.6s_ease-out_both] hover:shadow-purple-500/10 transition-shadow duration-500">
              <form onSubmit={handleCreatePost}>
                <textarea 
                  value={newPostText} onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Partagez vos pensées..."
                  className="w-full h-20 sm:h-24 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
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
                  <div className="w-full sm:w-auto">
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-medium cursor-pointer transition-all hover:shadow-md">
                      📷 Ajouter une image
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
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
                  <div className="flex items-center gap-3 mb-4 sm:mb-5">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-300">{post.username}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-600">{new Date(post.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-3 sm:mb-4 font-light whitespace-pre-wrap text-sm">{post.text}</p>
                  {post.image_url && (
                    <div className="mb-3 sm:mb-4">
                      <img src={post.image_url} alt="Post image" className="w-full max-h-64 sm:max-h-96 object-cover rounded-xl" />
                    </div>
                  )}
                  <div className="flex items-center gap-4 sm:gap-6 mb-3 sm:mb-4 border-t border-slate-200 dark:border-slate-800 pt-3 sm:pt-4">
                    <button 
                      onClick={() => handleLike(post.id)} 
                      className="flex items-center gap-1 sm:gap-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors text-xs sm:text-sm"
                    >
                      ❤️ {post.likes}
                    </button>
                    <span className="flex items-center gap-1 sm:gap-2 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                      💬 {post.comments?.length || 0}
                    </span>
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
                        className="flex-1 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
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
            </div>
          </div>
        )}

        {view === 'admin-dashboard' && (
          <div className="animate-[fadeIn_0.4s_ease-out]">
            <h2 className="text-xl text-slate-900 dark:text-slate-200 mb-8">Dashboard Admin</h2>
            <p className="text-slate-600 dark:text-slate-400">Le dashboard admin sera ajouté plus tard...</p>
          </div>
        )}

      </main>

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
      `}</style>
    </div>
  );
}

export default App;
