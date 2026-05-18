import React, { useState, useEffect } from 'react';
import heroImage from '../image.png';
import { 
  ChatCircle, 
  UserFocus, 
  Heart, 
  Envelope, 
  Phone, 
  WhatsappLogo, 
  Sparkles, 
  Sun, 
  Moon, 
  ArrowRight,
  ShieldCheck,
  Quotes
} from '@phosphor-icons/react';

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
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 font-sans overflow-x-hidden transition-colors duration-500">
      
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center px-4 sm:px-6 py-12 sm:py-20 md:py-24 overflow-hidden">
        {/* Subtle Background Ambient Orbs - Zero neon purple glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-32 -left-32 w-80 h-80 sm:w-[450px] sm:h-[450px] bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-[120px] transition-all duration-700"
            style={{ transform: `translate(${mousePos.x * 0.005}px, ${mousePos.y * 0.005}px)` }}
          ></div>
          <div 
            className="absolute -bottom-32 -right-32 w-80 h-80 sm:w-[450px] sm:h-[450px] bg-zinc-400/10 dark:bg-zinc-800/10 rounded-full blur-[120px] transition-all duration-700"
            style={{ 
              animationDelay: '1.5s',
              transform: `translate(${-mousePos.x * 0.005}px, ${-mousePos.y * 0.005}px)`
            }}
          ></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto w-full">
          {/* Navigation - Premium Minimalism */}
          <nav 
            className="flex justify-between items-center mb-12 sm:mb-20 transition-all duration-300"
            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/10">
                <Heart size={18} weight="fill" />
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-[0.15em] uppercase text-zinc-900 dark:text-white">
                Anonyme Pro
              </h1>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <button 
                onClick={toggleTheme} 
                className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/40 flex items-center justify-center hover:scale-105 transition-all text-zinc-600 dark:text-zinc-400"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button 
                onClick={onGetStarted}
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-emerald-600/10 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Se connecter</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </button>
            </div>
          </nav>
          
          {/* Two-Column Hero Content - Asymmetrical Split Screen */}
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center text-left mt-4 lg:mt-8">
            <div 
              className="lg:col-span-7 space-y-6 sm:space-y-8 animate-[slideUp_0.8s_ease-out_both]"
              style={{ transform: `translateY(${scrollY * 0.03}px)` }}
            >
              {/* Premium micro-message */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 rounded-full">
                <Sparkles size={12} className="text-emerald-600 dark:text-emerald-300" />
                <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold tracking-widest uppercase">
                  Un espace sûr pour écouter & s'exprimer
                </p>
              </div>
              
              {/* Main Heading - Deterministic Typography */}
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tighter leading-tight text-zinc-900 dark:text-white max-w-[15ch]">
                Parce que <span className="font-semibold text-emerald-600 dark:text-emerald-400">vos émotions</span> méritent d'être entendues
              </h2>
              
              {/* Subtext */}
              <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-[50ch]">
                Rejoignez une communauté bienveillante où vous pouvez partager vos confessions anonymement, écouter et trouver du soutien professionnel sans aucun jugement.
              </p>
              
              {/* CTA Button */}
              <div className="pt-2">
                <button 
                  onClick={onGetStarted}
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold text-sm sm:text-base tracking-wide transition-all shadow-lg shadow-emerald-600/15 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Commencer le voyage</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Right Column: Hero Visual - Refined with Liquid Glass refraction */}
            <div className="lg:col-span-5 w-full flex justify-center animate-[slideUp_0.8s_ease-out_0.2s_both]">
              <div className="relative w-full max-w-md bg-white/5 dark:bg-zinc-900/10 backdrop-blur-md p-3 border border-white/10 dark:border-white/5 rounded-[2.5rem] shadow-2xl shadow-emerald-950/5 hover:shadow-emerald-950/10 hover:border-emerald-500/20 dark:hover:border-emerald-400/10 hover:scale-[1.01] transition-all duration-700 animate-[float_6s_ease-in-out_infinite] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <img 
                  src={heroImage} 
                  alt="Anonyme Health AI Showcase" 
                  className="w-full h-auto rounded-[2rem] object-cover shadow-inner transition-transform duration-700 hover:scale-[1.005]" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smooth Section Transition */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent w-full"></div>

      {/* Features Section - Staggered 2-Column Zig-Zag (Anti-3-Card Slop) */}
      <section className="px-4 sm:px-6 py-20 sm:py-28 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-5 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 left-5 w-64 h-64 bg-zinc-300/10 dark:bg-zinc-800/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto space-y-24 sm:space-y-36">
          {/* Header section */}
          <div className="text-left max-w-2xl">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 font-bold mb-3">Ce que nous offrons</h3>
            <h2 className="text-3xl sm:text-5xl font-light text-zinc-950 dark:text-white leading-tight">
              Un accompagnement profondément <span className="font-semibold text-emerald-600 dark:text-emerald-400">humain</span> et sécurisé
            </h2>
          </div>
          
          {/* Feature 1 - Left content, right visual mockup */}
          <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-center">
            <div className="md:col-span-6 space-y-6">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                <ChatCircle size={24} weight="light" />
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">Partagez librement</h4>
              <p className="text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-[45ch]">
                Exprimez vos pensées les plus secrètes et vos émotions vécues au quotidien dans un espace confidentiel à 100%. Vous gardez le contrôle total sur votre identité grâce à notre système d'anonymat renforcé.
              </p>
            </div>
            
            <div className="md:col-span-6">
              {/* Refraction Liquid glass container */}
              <div className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-500 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">A. N.</div>
                    <div className="bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl rounded-tl-none p-3.5 max-w-[80%]">
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 font-light">Je me sens dépassée par la charge de travail cette semaine, c'est dur à supporter.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-none p-3.5 max-w-[80%] shadow-sm">
                      <p className="text-xs font-light">Vous n'êtes pas seule. Prenez une inspiration profonde, nous sommes là pour écouter.</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-600/10">🧘</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 - Right content, left visual mockup */}
          <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-center md:flex-row-reverse">
            <div className="md:col-span-6 md:order-2 space-y-6">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                <UserFocus size={24} weight="light" />
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">Accompagnement par des Coachs</h4>
              <p className="text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-[45ch]">
                Bénéficiez de la bienveillance et de l'écoute active de coaches professionnels. Formés à la psychologie de soutien, ils sont présents pour vous accompagner pas à pas vers un bien-être serein.
              </p>
            </div>
            
            <div className="md:col-span-6 md:order-1">
              <div className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-500 backdrop-blur-sm relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl">🌿</div>
                  <div className="space-y-1">
                    <h5 className="text-sm font-semibold text-zinc-900 dark:text-white">Conseillers en ligne</h5>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-light">Disponibilité immédiate pour échanger</p>
                  </div>
                  <span className="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/60 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl">
                    <span className="block text-xl font-bold text-zinc-900 dark:text-white">100%</span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-light uppercase tracking-wider">Confidentialité</span>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl">
                    <span className="block text-xl font-bold text-zinc-900 dark:text-white">24/7</span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-light uppercase tracking-wider">Disponibilité</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 - Left content, right visual mockup */}
          <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-center">
            <div className="md:col-span-6 space-y-6">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={24} weight="light" />
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">Sécurité & Anonymat de pointe</h4>
              <p className="text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-[45ch]">
                Notre infrastructure est pensée pour préserver votre vie privée. Vos messages et confessions n'affichent jamais vos informations sensibles si vous optez pour l'anonymat. Exprimez-vous sereinement, l'esprit tranquille.
              </p>
            </div>
            
            <div className="md:col-span-6">
              <div className="bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-500 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={20} weight="fill" />
                  <span className="text-xs font-bold uppercase tracking-wider">Algorithme d'anonymisation</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 leading-relaxed font-light">
                  Chaque publication anonyme subit un masquage cryptographique de son auteur au niveau du serveur, garantissant que vos données personnelles ne transitent jamais sur le réseau public.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Smooth Section Transition */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent w-full"></div>

      {/* Testimonials Section - Bento Grid Asymmetry */}
      <section className="px-4 sm:px-6 py-20 sm:py-28 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-4 w-56 h-56 bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto space-y-16">
          <div className="text-left">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 font-bold mb-3">Témoignages</h3>
            <h2 className="text-3xl sm:text-5xl font-light text-zinc-950 dark:text-white leading-tight">
              Des vies profondément <span className="font-semibold text-emerald-600 dark:text-emerald-400">changées</span>
            </h2>
          </div>
          
          {/* Staggered Bento grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Feature Card (5 Cols) */}
            <div className="lg:col-span-5 bg-emerald-600 dark:bg-emerald-600/90 text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-lg relative overflow-hidden min-h-[300px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <Quotes size={48} weight="fill" className="opacity-20 text-white mb-6" />
              <h4 className="text-2xl sm:text-3xl font-light leading-tight tracking-tight mb-8">
                Votre voix compte. Vos secrets sont gardés avec le plus grand soin.
              </h4>
              <div>
                <p className="text-xs text-emerald-200 uppercase tracking-widest font-semibold mb-1">Rever Care System</p>
                <p className="text-xs text-white/80 font-light">Une écoute humaine sans préjugé.</p>
              </div>
            </div>

            {/* Right Stack of 2 Testimonial Cards (7 Cols) */}
            <div className="lg:col-span-7 grid gap-6">
              
              {/* Testimonial 1 */}
              <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl p-6 sm:p-8 hover:bg-white dark:hover:bg-zinc-900/80 transition-all duration-500 shadow-sm flex flex-col sm:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <Quotes size={24} weight="fill" className="text-emerald-500 dark:text-emerald-400 opacity-60" />
                  <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-light leading-relaxed">
                    "Rever m'a permis de surmonter le stress énorme des examens et de la pression sociale. Pouvoir s'exprimer sans filtre m'a libérée."
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:border-l sm:border-zinc-100 sm:dark:border-zinc-850 sm:pl-6 shrink-0 sm:w-48">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">F. D.</div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white text-xs sm:text-sm">F. D.</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-light">Master 2 (UCAD)</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl p-6 sm:p-8 hover:bg-white dark:hover:bg-zinc-900/80 transition-all duration-500 shadow-sm flex flex-col sm:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <Quotes size={24} weight="fill" className="text-emerald-500 dark:text-emerald-400 opacity-60" />
                  <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-light & leading-relaxed">
                    "L'anonymat complet me permet d'évoquer mes doutes et mes peines quotidiennes sans craindre le jugement de mon entourage universitaire."
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:border-l sm:border-zinc-100 sm:dark:border-zinc-850 sm:pl-6 shrink-0 sm:w-48">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">M. D.</div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white text-xs sm:text-sm">M. D.</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-light">Licence 3 (UGB)</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Smooth Section Transition */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent w-full"></div>

      {/* CTA Section - Minimalist Glass panel */}
      <section className="px-4 sm:px-6 py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-zinc-300/10 dark:bg-zinc-800/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/40 rounded-3xl p-8 sm:p-12 shadow-sm hover:border-emerald-500/20 transition-all duration-500 shadow-xl shadow-zinc-950/5">
            <h2 className="text-3xl sm:text-5xl font-light text-zinc-900 dark:text-white mb-4">Prêt à commencer le voyage ?</h2>
            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 mb-8 max-w-xl mx-auto font-light leading-relaxed">
              Rejoignez des milliers de personnes qui ont déjà fait le premier pas vers leur bien-être et leur sérénité d'esprit.
            </p>
            <button 
              onClick={onGetStarted}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold text-sm sm:text-base tracking-wide shadow-md shadow-emerald-600/10 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
            >
              <span>Créer mon compte gratuit</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </section>

      {/* Smooth Section Transition */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent w-full"></div>

      {/* Contact Coordinates Section */}
      <section className="px-4 sm:px-6 py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 font-bold mb-3">Nous contacter</h3>
          <h2 className="text-3xl sm:text-4xl font-light text-zinc-900 dark:text-white mb-16">
            Besoin d'aide ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">Restons en contact</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            {/* Email Card */}
            <a 
              href="mailto:contact@annonyme.pro" 
              className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl p-8 hover:bg-white dark:hover:bg-zinc-900/80 hover:border-emerald-500/20 transition-all duration-500 shadow-sm hover:scale-[1.02] group block"
            >
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Envelope size={24} weight="light" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">E-mail</h4>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-4">Notre équipe vous répond sous 24 heures.</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">contact@annonyme.pro</p>
            </a>

            {/* WhatsApp Card */}
            <a 
              href="https://wa.me/221777091913" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl p-8 hover:bg-white dark:hover:bg-zinc-900/80 hover:border-emerald-500/20 transition-all duration-500 shadow-sm hover:scale-[1.02] group block"
            >
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <WhatsappLogo size={24} weight="light" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">WhatsApp</h4>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-4">Discutez en direct avec un coach bienveillant.</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">+221 77 709 19 13</p>
            </a>

            {/* Phone Card */}
            <a 
              href="tel:+221777091913" 
              className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl p-8 hover:bg-white dark:hover:bg-zinc-900/80 hover:border-emerald-500/20 transition-all duration-500 shadow-sm hover:scale-[1.02] group block"
            >
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Phone size={24} weight="light" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Téléphone</h4>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mb-4">Appelez-nous directement pour toute urgence.</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">+221 77 709 19 13</p>
            </a>
          </div>
        </div>
      </section>

      {/* Smooth Section Transition */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent w-full"></div>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-12 border-t border-zinc-200/60 dark:border-zinc-800/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Heart size={14} weight="fill" />
            </div>
            <span className="text-sm font-bold tracking-[0.1em] uppercase text-zinc-700 dark:text-zinc-300">Anonyme Pro</span>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">© 2026 Anonyme Pro. Tous droits réservés.</p>
        </div>
      </footer>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Outfit', sans-serif;
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

export default LandingPage;
