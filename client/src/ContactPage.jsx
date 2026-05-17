import React, { useState, useEffect } from 'react';
import api from './api/client';

function ContactPage({ onBack, onGetStarted, theme, toggleTheme }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/contact', formData);
      alert('Merci pour votre message ! Nous vous répondrons rapidement.');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950 text-slate-800 dark:text-slate-100 font-sans overflow-x-hidden transition-colors duration-500">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-3xl animate-pulse transition-all duration-700"
          style={{ transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)` }}
        ></div>
        <div 
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse transition-all duration-700"
          style={{ 
            animationDelay: '2s',
            transform: `translate(${-mousePos.x * 0.02}px, ${-mousePos.y * 0.02}px)`
          }}
        ></div>
      </div>
      
      {/* Navigation */}
      <nav className="px-4 py-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-50 relative">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold"
          >
            ← Retour
          </button>
          <h1 className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase text-slate-900 dark:text-white">Anonyme Pro</h1>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="text-xl sm:text-2xl hover:scale-110 transition-transform">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={onGetStarted}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full text-sm font-medium transition-all"
            >
              Commencer
            </button>
          </div>
        </div>
      </nav>

      <main className="px-4 py-12 md:py-20 relative">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16" style={{ transform: `translateY(${scrollY * 0.05}px)` }}>
            <h2 className="text-3xl md:text-5xl font-light mb-4 text-slate-900 dark:text-white animate-[fadeIn_0.8s_ease-out]">Restons en <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400">contact</span></h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-200 max-w-2xl mx-auto leading-relaxed animate-[slideUp_0.8s_ease-out_0.2s_both]">
              Votre voix compte. Partagez-nous vos réflexions, vos suggestions ou simplement dites bonjour.
            </p>
          </div>

          {/* Feedback Section */}
          <section className="mb-16">
            <h3 className="text-xs md:text-sm uppercase tracking-[0.3em] text-blue-500 dark:text-blue-400 mb-8 text-center font-semibold animate-[fadeIn_0.8s_ease-out_0.3s_both]">Votre avis compte</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 md:p-8 text-center hover:bg-white dark:hover:bg-slate-800/90 hover:-translate-y-2 transition-all animate-[slideUp_0.8s_ease-out_0.4s_both] shadow-sm hover:shadow-xl hover:shadow-purple-500/10 backdrop-blur-sm">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💡</div>
                <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">Suggestions</h4>
                <p className="text-slate-600 dark:text-slate-200 text-sm leading-relaxed">
                  Une idée pour améliorer l'expérience Anonyme Pro ? Nous serions ravis de l'entendre !
                </p>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 md:p-8 text-center hover:bg-white dark:hover:bg-slate-800/90 hover:-translate-y-2 transition-all animate-[slideUp_0.8s_ease-out_0.6s_both] shadow-sm hover:shadow-xl hover:shadow-blue-500/10 backdrop-blur-sm">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🛠️</div>
                <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">Problèmes</h4>
                <p className="text-slate-600 dark:text-slate-200 text-sm leading-relaxed">
                  Vous rencontrez une difficulté ? Notre équipe est là pour vous aider.
                </p>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 md:p-8 text-center hover:bg-white dark:hover:bg-slate-800/90 hover:-translate-y-2 transition-all animate-[slideUp_0.8s_ease-out_0.8s_both] shadow-sm hover:shadow-xl hover:shadow-pink-500/10 backdrop-blur-sm">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💕</div>
                <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">Ce que vous aimez</h4>
                <p className="text-slate-600 dark:text-slate-200 text-sm leading-relaxed">
                  Partagez ce qui vous plaît sur Anonyme Pro ! Ça nous fait plaisir.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Form & Info */}
          <section className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6 animate-[slideUp_0.8s_ease-out_1s_both]">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-6">Nos coordonnées</h3>
              
              <a href="mailto:contact@annonyme.pro" className="bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 flex items-start gap-4 hover:bg-white dark:hover:bg-slate-800/90 hover:scale-[1.02] transition-all shadow-sm backdrop-blur-sm group block">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  📧
                </div>
                <div>
                  <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-1">Email</h4>
                  <p className="text-slate-600 dark:text-slate-200 font-medium">contact@annonyme.pro</p>
                </div>
              </a>
              
              <a href="https://wa.me/221777091913" target="_blank" rel="noopener noreferrer" className="bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 flex items-start gap-4 hover:bg-white dark:hover:bg-slate-800/90 hover:scale-[1.02] transition-all shadow-sm backdrop-blur-sm group block">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  💬
                </div>
                <div>
                  <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-1">WhatsApp</h4>
                  <p className="text-slate-600 dark:text-slate-200 font-medium">+221 77 709 19 13</p>
                </div>
              </a>
              
              <a href="tel:+221777091913" className="bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 flex items-start gap-4 hover:bg-white dark:hover:bg-slate-800/90 hover:scale-[1.02] transition-all shadow-sm backdrop-blur-sm group block">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  📞
                </div>
                <div>
                  <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-1">Téléphone</h4>
                  <p className="text-slate-600 dark:text-slate-200 font-medium">+221 77 709 19 13</p>
                </div>
              </a>
            </div>

            {/* Contact Form */}
            <div className="bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 md:p-8 animate-[slideUp_0.8s_ease-out_1.2s_both] shadow-sm backdrop-blur-sm">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-6">Envoyez-nous un message</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Votre nom" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                />
                <input 
                  type="email" 
                  placeholder="Votre email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                />
                <textarea 
                  placeholder="Votre message..." 
                  rows="6"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-600 rounded-lg p-3 text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 resize-none transition-all"
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg font-bold text-base transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-12 border-t border-slate-200 dark:border-slate-800 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="text-xl font-light tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Anonyme Pro</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">© 2026 Anonyme Pro. Tous droits réservés.</p>
          </div>
        </div>
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
      `}</style>
    </div>
  );
}

export default ContactPage;
