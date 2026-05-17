import React, { useState, useEffect } from 'react';
import heroImage from '../image.png';

function LandingPage({ onGetStarted, onContact, theme, toggleTheme }) {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans overflow-x-hidden transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 py-16 sm:py-20 md:py-24 overflow-hidden">
        {/* Subtle Background Orbs - Reduced intensity */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-24 -left-24 w-64 h-64 sm:w-80 sm:h-80 bg-purple-600/12 rounded-full blur-3xl animate-pulse transition-all duration-700"
            style={{ transform: `translate(${mousePos.x * 0.01}px, ${mousePos.y * 0.01}px)` }}
          ></div>
          <div 
            className="absolute -bottom-24 -right-24 w-64 h-64 sm:w-80 sm:h-80 bg-blue-600/12 rounded-full blur-3xl animate-pulse transition-all duration-700"
            style={{ 
              animationDelay: '2.5s',
              transform: `translate(${-mousePos.x * 0.01}px, ${-mousePos.y * 0.01}px)`
            }}
          ></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto w-full">
          {/* Navigation - Balanced */}
          <nav 
            className="flex justify-between items-center mb-12 sm:mb-16 md:mb-20 lg:mb-24 transition-all duration-300"
            style={{ transform: `translateY(${scrollY * 0.08}px)` }}
          >
            <div className="flex items-center gap-4 sm:gap-8">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-slate-900 dark:text-white">
                Anonyme Pro
              </h1>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <button onClick={toggleTheme} className="text-xl sm:text-2xl hover:scale-110 transition-transform" aria-label="Toggle Dark Mode">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button 
                onClick={onGetStarted}
                className="group relative inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_200%] hover:bg-[length:100%_100%] text-white rounded-full font-medium text-sm sm:text-base tracking-wide transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10">Se connecter</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300 relative z-10">→</span>
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></span>
              </button>
            </div>
          </nav>
          
          {/* Two-Column Hero Content */}
          <div className="grid lg:grid-cols-12 gap-12 items-center text-left mt-8 lg:mt-16">
            <div 
              className="lg:col-span-7 space-y-6 sm:space-y-8 animate-[slideUp_1s_ease-out_both]"
              style={{ transform: `translateY(${scrollY * 0.04}px)` }}
            >
              {/* Emotional micro-message */}
              <div className="inline-block px-4 py-1.5 bg-purple-500/10 dark:bg-purple-400/10 border border-purple-500/20 rounded-full">
                <p className="text-xs text-purple-600 dark:text-purple-300 font-bold tracking-widest uppercase animate-[fadeIn_1s_ease-out]">
                  ✨ Un espace sûr pour écouter & s'exprimer
                </p>
              </div>
              
              {/* Main Heading */}
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-light leading-tight text-slate-900 dark:text-white">
                Parce que <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-300 dark:to-blue-300">vos émotions</span> méritent d'être entendues
              </h2>
              
              {/* Subtext */}
              <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-light leading-relaxed">
                Rejoignez une communauté bienveillante où vous pouvez partager vos confessions anonymement, écouter et trouver du soutien professionnel sans jugement.
              </p>
              
              {/* CTA Button */}
              <div>
                <button 
                  onClick={onGetStarted}
                  className="group relative inline-flex items-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_200%] hover:bg-[length:100%_100%] text-white rounded-full font-semibold text-base sm:text-lg tracking-wide transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10">Commencer le voyage</span>
                  <span className="group-hover:translate-x-1.5 transition-transform duration-300 relative z-10">→</span>
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></span>
                </button>
              </div>
            </div>

            {/* Right Column: Hero Visual Image */}
            <div className="lg:col-span-5 w-full flex justify-center animate-[slideUp_1s_ease-out_0.2s_both]">
              <div className="relative w-full max-w-lg bg-white/5 dark:bg-slate-900/10 backdrop-blur-md p-3 sm:p-4 border border-slate-200/40 dark:border-slate-700/30 rounded-[2.5rem] shadow-2xl shadow-purple-500/5 hover:shadow-purple-500/15 hover:border-purple-500/30 dark:hover:border-purple-400/20 hover:scale-[1.02] transition-all duration-700 animate-[float_6s_ease-in-out_infinite] group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <img 
                  src={heroImage} 
                  alt="Anonyme Health AI Showcase" 
                  className="w-full h-auto rounded-[2rem] object-cover shadow-inner transition-transform duration-700 group-hover:scale-[1.01]" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smooth Section Transition */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700/50 to-transparent w-full"></div>

      {/* Features Section - Improved readability */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-5 right-5 sm:top-10 sm:right-10 w-48 h-48 sm:w-64 sm:h-64 bg-purple-600/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-5 left-5 sm:bottom-10 sm:left-10 w-48 h-48 sm:w-64 sm:h-64 bg-blue-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-5xl sm:max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h3 className="text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-purple-500 dark:text-purple-400 mb-3 sm:mb-4 animate-[fadeIn_0.8s_ease-out]">Ce que nous offrons</h3>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-slate-900 dark:text-white mb-4 sm:mb-6 animate-[slideUp_0.8s_ease-out_0.2s_both]">Un accompagnement <span className="font-normal">humain</span></h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="group p-6 sm:p-8 bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl hover:bg-white dark:hover:bg-slate-800/80 hover:border-purple-300 dark:hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-500 animate-[slideUp_0.8s_ease-out_0.3s_both] shadow-sm hover:shadow-xl hover:shadow-purple-500/10 backdrop-blur-sm">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-xl sm:text-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                💬
              </div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">Partagez librement</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                Exprimez vos pensées et vos émotions dans un espace sécurisé et anonyme si vous le souhaitez.
              </p>
            </div>
            
            <div className="group p-6 sm:p-8 bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl hover:bg-white dark:hover:bg-slate-800/80 hover:border-blue-300 dark:hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-500 animate-[slideUp_0.8s_ease-out_0.5s_both] shadow-sm hover:shadow-xl hover:shadow-blue-500/10 backdrop-blur-sm">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-xl sm:text-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                🧘
              </div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300">Coachs professionnels</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                Bénéficiez de l'accompagnement de coaches formés et bienveillants prêts à vous écouter.
              </p>
            </div>
            
            <div className="group p-6 sm:p-8 bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl hover:bg-white dark:hover:bg-slate-800/80 hover:border-pink-300 dark:hover:border-pink-500/30 hover:-translate-y-1 transition-all duration-500 animate-[slideUp_0.8s_ease-out_0.7s_both] shadow-sm hover:shadow-xl hover:shadow-pink-500/10 sm:col-span-2 lg:col-span-1 sm:mx-auto lg:mx-0 sm:w-full backdrop-blur-sm">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-xl sm:text-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                ❤️
              </div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors duration-300">Communauté bienveillante</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                Connectez-vous avec d'autres personnes qui comprennent ce que vous traversez.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Smooth Section Transition */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700/50 to-transparent w-full"></div>

      {/* Testimonials Section - Improved */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-4 sm:left-8 w-40 h-40 sm:w-56 sm:h-56 bg-pink-600/8 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <h3 className="text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-purple-500 dark:text-purple-400 mb-3 sm:mb-4 animate-[fadeIn_0.8s_ease-out]">Témoignages</h3>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-slate-900 dark:text-white mb-8 sm:mb-12 animate-[slideUp_0.8s_ease-out_0.2s_both]">Des vies <span className="font-normal">touchées</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
            {/* Testimonial 1 */}
            <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/40 rounded-3xl p-6 sm:p-8 hover:bg-white dark:hover:bg-slate-800/70 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-purple-500/5 animate-[slideUp_0.8s_ease-out_0.4s_both] flex flex-col justify-between">
              <div>
                <svg className="w-8 h-8 text-purple-500 dark:text-purple-400 mb-4 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <p className="text-base text-slate-700 dark:text-slate-200 mb-6 font-light leading-relaxed">
                  "Rever m'a permis de surmonter le stress énorme des examens et de la pression sociale. Pouvoir s'exprimer sans filtre m'a libérée."
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-700/40 pt-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">FD</div>
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white text-xs sm:text-sm">Fatoumata Diop</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-light">Étudiante en Master 2 (UCAD)</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/40 rounded-3xl p-6 sm:p-8 hover:bg-white dark:hover:bg-slate-800/70 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-blue-500/5 animate-[slideUp_0.8s_ease-out_0.5s_both] flex flex-col justify-between">
              <div>
                <svg className="w-8 h-8 text-blue-500 dark:text-blue-400 mb-4 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <p className="text-base text-slate-700 dark:text-slate-200 mb-6 font-light leading-relaxed">
                  "L'anonymat complet me permet d'évoquer mes doutes et mes peines quotidiennes sans craindre le jugement de mon entourage universitaire."
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-700/40 pt-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white">MD</div>
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white text-xs sm:text-sm">Mariama Diallo</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-light">Étudiante en Licence 3 (UGB)</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700/40 rounded-3xl p-6 sm:p-8 hover:bg-white dark:hover:bg-slate-800/70 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-pink-500/5 animate-[slideUp_0.8s_ease-out_0.6s_both] flex flex-col justify-between">
              <div>
                <svg className="w-8 h-8 text-pink-500 dark:text-pink-400 mb-4 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
                <p className="text-base text-slate-700 dark:text-slate-200 mb-6 font-light leading-relaxed">
                  "Échanger en toute confiance avec des coachs bienveillants et d'autres étudiantes m'a redonné le courage de poursuivre mes études sereinement."
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-700/40 pt-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white">AN</div>
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white text-xs sm:text-sm">Aïda Ndiaye</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-light">Étudiante en Médecine (UIDT)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smooth Section Transition */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700/50 to-transparent w-full"></div>

      {/* CTA Section - Improved */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 sm:-top-16 sm:-left-16 w-56 h-56 sm:w-72 sm:h-72 bg-purple-600/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 sm:-bottom-16 sm:-right-16 w-56 h-56 sm:w-72 sm:h-72 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="relative max-w-3xl sm:max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 border border-purple-200 dark:border-purple-500/20 rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 animate-[slideUp_0.8s_ease-out_0.2s_both]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-slate-900 dark:text-white mb-4 sm:mb-6">Prêt à commencer ?</h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-200 mb-6 sm:mb-10 max-w-xl sm:max-w-2xl mx-auto font-normal leading-relaxed">
              Rejoignez des milliers de personnes qui ont déjà fait le premier pas vers leur bien-être.
            </p>
            <button 
              onClick={onGetStarted}
              className="group inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-semibold text-base sm:text-lg tracking-wide hover:shadow-2xl hover:shadow-slate-900/15 dark:hover:shadow-white/15 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
            >
              <span className="relative z-10">Créer mon compte gratuit</span>
              <span className="group-hover:translate-x-1.5 transition-transform duration-300 relative z-10">✨</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Improved */}
      <footer className="px-4 sm:px-6 py-8 sm:py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl sm:max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <h2 className="text-lg sm:text-xl font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 cursor-pointer">Anonyme Pro</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-300">© 2026 Anonyme Pro. Tous droits réservés.</p>
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
            transform: translateY(40px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
