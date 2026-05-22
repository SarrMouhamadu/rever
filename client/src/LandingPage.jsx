import { useState, useEffect } from 'react';
import api from './api/client';
import {
  ArrowRight,
  ChatsCircle,
  Heart,
  EnvelopeSimple,
  Phone,
  UserCircle,
  Users,
  ShieldCheck,
  Plant,
  Heartbeat
} from '@phosphor-icons/react';
import heroImage from '../image.png';
import Button from './components/ui/Button';
import ThemeToggle from './components/ui/ThemeToggle';
import IconBox from './components/ui/IconBox';
import { CoachCertificationsSection } from './components/CoachCertifications';

const features = [
  {
    icon: ChatsCircle,
    title: 'Parler librement & anonymement',
    body: 'Exprimez ce que vous traversez — stress universitaire, solitude, pression sociale — dans un espace sécurisé. Votre pseudo suffit, sans jugement.',
  },
  {
    icon: UserCircle,
    title: 'Coachs professionnels à l\'écoute',
    body: 'Des professionnels de santé mentale certifiés répondent en message privé, à votre rythme. Soutien émotionnel humain, disponible depuis le Sénégal et toute l\'Afrique.',
  },
  {
    icon: Heart,
    title: 'Communauté bienveillante & entraide',
    body: 'Un réseau d\'entraide modéré où chaque étudiant africain peut être entendu. Bien-être étudiant, anonymat respecté, confiance garantie.',
  },
];

const testimonials = [
  {
    quote:
      'Pouvoir écrire sans que ma famille le sache m\'a aidée pendant les partiels. La pression est toujours là, mais je respire mieux.',
    initials: 'FD',
    name: 'Fatou D.',
    role: 'Master 2, Dakar',
  },
  {
    quote:
      'Les coachs répondent vite et sans formules toutes faites. J\'ai enfin trouvé des mots pour ce que je ressentais.',
    initials: 'AN',
    name: 'Aminata N.',
    role: 'Licence 3, Saint-Louis',
  },
];

function LandingPage({ onGetStarted, onContact, theme, toggleTheme }) {
  const [contactHover, setContactHover] = useState(null);
  const [activeCard, setActiveCard] = useState(0);
  const [cardHovered, setCardHovered] = useState(false);
  const [communityStats, setCommunityStats] = useState({
    activeMembers: 0,
    activeCoaches: 0,
    activeProfessionals: 0,
  });

  useEffect(() => {
    api
      .get('/api/analytics/community-stats')
      .then((res) => {
        if (res && res.data && typeof res.data === 'object' && !res.data.error) {
          setCommunityStats(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
      setCardHovered(false);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const appleCards = [
    {
      title: 'Communauté en direct',
      subtitle: 'Membres actifs',
      desc: 'Partages anonymes, bienveillants et écoute mutuelle. Santé mentale étudiante au cœur de l\'Afrique.',
      badge: 'Live',
      icon: <Users weight="regular" />,
      gradient: 'bg-live-sky-muted/90 dark:bg-live-sky-dark/15 border-live-sky/25 dark:border-live-sky/20 text-zinc-900 dark:text-zinc-100',
      badgeClass: 'chip-live-sky',
      glow: 'shadow-glow-sky',
    },
    {
      title: 'Soutien & Écoute',
      subtitle: 'Coachs actifs',
      desc: 'Des professionnels de santé mentale pour vous accompagner au Sénégal et en Afrique.',
      badge: 'Disponibles',
      icon: <Heartbeat weight="regular" />,
      gradient: 'bg-live-coral-muted/90 dark:bg-live-coral-dark/15 border-live-coral/25 dark:border-live-coral/20 text-zinc-900 dark:text-zinc-100',
      badgeClass: 'chip-live-coral',
      glow: 'shadow-glow-coral',
    },
    {
      title: 'Confidentialité totale',
      subtitle: 'Anonymat garanti',
      desc: 'Espace sécurisé, chiffré et conforme au RGPD. Parlez sans exposer votre identité.',
      badge: 'Sécurisé',
      icon: <ShieldCheck weight="regular" />,
      gradient: 'bg-live-lavender-muted/90 dark:bg-live-lavender-dark/15 border-live-lavender/25 dark:border-live-lavender/20 text-zinc-900 dark:text-zinc-100',
      badgeClass: 'chip-live-lavender',
      glow: 'shadow-glow-lavender',
    },
  ];

  const featureTones = ['sky', 'coral', 'sage'];
  const tagChips = [
    { label: 'Santé mentale', className: 'chip-live-sky' },
    { label: 'Bien-être étudiant', className: 'chip-live-sage' },
    { label: 'Anonymat total', className: 'chip-live-lavender' },
    { label: 'Soutien émotionnel', className: 'chip-live-coral' },
    { label: 'HealthTech Afrique', className: 'chip-live-peach' },
  ];

  return (
    <div className="min-h-[100dvh] relative">
      <header className="sticky top-0 z-40 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-canvas/90 dark:bg-canvas-dark/90 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-[0.18em] uppercase text-zinc-900 dark:text-zinc-100">
            Anonyme Pro
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onContact}
              className="hidden sm:inline text-sm text-zinc-600 dark:text-zinc-400 hover:text-accent-600 dark:hover:text-accent-400 transition-premium active-squeeze hover:scale-105 focus-ring rounded-lg px-3 py-2"
            >
              Contact
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <Button onClick={onGetStarted} className="!px-4 !py-2.5 text-sm">
              Connexion
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO — Santé mentale Afrique, bien-être étudiant, parler anonymement */}
        <section aria-label="Présentation" className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-slide-up space-y-8">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] chip-live-sage px-4 py-2 rounded-full">
                Espace confidentiel · Sénégal & Afrique
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.05] text-balance">
                Vos émotions méritent d'être entendues
              </h1>
              <div className="space-y-4 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[65ch] font-light">
                <p>
                  Une plateforme de soutien émotionnel ouverte à tous — jeunes, étudiants, femmes, hommes et toute personne ayant besoin d&apos;écoute, de conseils ou d&apos;accompagnement.
                </p>
                <p>
                  Parlez anonymement, échangez avec des coachs et trouvez de l&apos;aide dans un espace bienveillant, sécurisé et sans jugement.
                </p>
              </div>
              {/* SEO contextual keywords — visible, authentic, within content */}
              <ul className="flex flex-wrap gap-2" aria-label="Thématiques">
                {tagChips.map((tag) => (
                  <li key={tag.label} className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${tag.className}`}>
                    {tag.label}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Button onClick={onGetStarted} className="group hover:shadow-lg">
                  Commencer gratuitement
                  <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </Button>
                <Button variant="outline" onClick={onContact}>
                  Nous écrire
                </Button>
              </div>
            </div>

            <div className="relative animate-slide-up lg:pl-8 pb-36 sm:pb-0" style={{ animationDelay: '0.1s' }}>
              <div className="squircle overflow-hidden border-zinc-200/80 dark:border-zinc-800 shadow-soft dark:shadow-soft-dark bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={heroImage}
                  alt="Étudiant africain en moment de calme symbolisant le soutien émotionnel anonyme"
                  className="w-full h-auto object-cover"
                  loading="eager"
                  width="600"
                  height="400"
                />
              </div>
              <div
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 sm:left-[-1.5rem] sm:translate-x-0 w-[16rem] sm:w-[17rem] h-[11rem] sm:h-[11.5rem] select-none"
                style={{ perspective: '1200px' }}
                onClick={() => setActiveCard((prev) => (prev + 1) % 3)}
              >
                {appleCards.map((card, i) => {
                  const diff = (i - activeCard + 3) % 3;
                  const isActive = diff === 0;
                  const isHovered = isActive && cardHovered;

                  return (
                    <div
                      key={i}
                      onMouseEnter={() => isActive && setCardHovered(true)}
                      onMouseLeave={() => setCardHovered(false)}
                      className={`absolute inset-0 squircle p-5 flex flex-col justify-between transition-all duration-700 ease-out backdrop-blur-xl ${isActive ? 'shadow-2xl' : 'shadow-md'} ${card.gradient} ${card.glow} cursor-pointer ${isActive ? 'active-squeeze' : ''}`}
                      style={{
                        transform: isHovered
                          ? 'translate3d(0px, -12px, 20px) scale(1.05) rotateY(0deg) rotateZ(0deg)'
                          : `translate3d(${diff * 14}px, ${diff * -14}px, ${diff * -40}px) rotateY(${diff * -6}deg) rotateZ(${diff * 1.5}deg)`,
                        opacity: diff === 0 ? 1 : diff === 1 ? 0.8 : 0.4,
                        zIndex: 30 - diff,
                        pointerEvents: isActive ? 'auto' : 'none',
                        willChange: 'transform, opacity',
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-2xl">{card.icon}</span>
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${card.badgeClass} flex items-center gap-1.5`}>
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                          </span>
                          {card.badge}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-65">
                          {card.title}
                        </p>
                        <h4 className="text-base font-bold tracking-tight">
                          {card.subtitle}
                        </h4>
                        <p className="text-[11px] font-light leading-snug opacity-80 line-clamp-2">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES — Soutien psychologique, communauté bienveillante */}
        <section aria-label="Fonctionnalités" className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/30 py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-16 md:mb-20">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-300 mb-3">
                Plateforme de soutien · IA & Bien-être
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 text-balance">
                Conçu pour la parole, pas pour la performance
              </h2>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                Anonyme Pro combine intelligence artificielle et accompagnement humain pour offrir un soutien de santé mentale accessible à tous les jeunes d'Afrique.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {features.map((item, i) => (
                <article
                  key={item.title}
                  className={`flex gap-5 p-6 md:p-8 squircle border-zinc-200/60 dark:border-zinc-800/60 hover-lift-premium transition-all group ${i === 2 ? 'md:col-span-2 md:max-w-xl' : ''}`}
                >
                  <IconBox icon={item.icon} tone={featureTones[i]} className="shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-prose">
                      {item.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* STATS — Preuve sociale pour le SEO */}
        <section aria-label="Statistiques" className="py-16 md:py-20 px-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200/50 dark:border-zinc-800/50">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 sm:gap-8 px-4">
  {[
    { icon: <Users weight="regular" />, text: 'Membres actifs', iconTone: 'sky' },
    { icon: <Heartbeat weight="regular" />, text: 'Coachs certifiés', iconTone: 'coral' },
    { icon: <ShieldCheck weight="regular" />, text: 'Anonymat garanti', iconTone: 'lavender' },
  ].map((stat, i) => {
    return (
      <div 
        key={i}
        className="relative group cursor-pointer"
        style={{ perspective: '1200px' }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -15;
          const rotateY = ((x - centerX) / centerX) * 15;
          e.currentTarget.firstElementChild.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.firstElementChild.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        }}
      >
        <div 
          className="glass-panel squircle p-10 flex flex-col items-center justify-center transition-transform duration-200 ease-out border-zinc-200/60 dark:border-zinc-800/60 shadow-lg"
          style={{ transformStyle: 'preserve-3d', transform: 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)' }}
        >
          <div
            className={`transform-gpu transition-all duration-300 group-hover:-translate-y-3 flex items-center justify-center text-5xl ${
              stat.iconTone === 'sky'
                ? 'text-live-sky-dark dark:text-live-sky'
                : stat.iconTone === 'coral'
                  ? 'text-live-coral-dark dark:text-live-coral'
                  : 'text-live-lavender-dark dark:text-live-lavender'
            }`}
            style={{ transform: 'translateZ(60px)' }}
          >
            {stat.icon}
          </div>
          <div className="mt-6" style={{ transform: 'translateZ(30px)' }}>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">{stat.text}</p>
          </div>
        </div>
      </div>
    );
  })}
</div>
        </section>

        {/* CERTIFICATIONS COACHS */}
        <section
          aria-label="Certifications des coachs"
          className="py-20 md:py-28 px-4 sm:px-6 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-live-lavender-muted/30 via-canvas to-canvas dark:from-live-lavender-dark/10 dark:via-canvas-dark dark:to-canvas-dark"
        >
          <div className="max-w-5xl mx-auto">
            <CoachCertificationsSection />
          </div>
        </section>

        {/* TESTIMONIALS — Retours utilisateurs réels */}
        <section aria-label="Témoignages" className="py-20 md:py-28 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-300 mb-3 text-center">
              Témoignages
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-center text-zinc-900 dark:text-zinc-50 mb-12 text-balance">
              Des étudiants africains témoignent
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {testimonials.map((t) => (
                <blockquote
                  key={t.initials}
                  className="glass-panel p-8 squircle flex flex-col justify-between min-h-[220px] hover-lift-premium border-transparent group"
                >
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-light italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="flex items-center gap-3 mt-8 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
                    <div className="w-10 h-10 rounded-xl bg-accent-600/90 dark:bg-accent-500/80 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                      {t.initials}
                    </div>
                    <div>
                      <cite className="not-italic font-medium text-sm text-zinc-900 dark:text-zinc-100">
                        {t.name}
                      </cite>
                      <p className="text-xs text-zinc-500">{t.role}</p>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section aria-label="Inscription" className="py-20 md:py-24 px-4 sm:px-6 border-t-2 border-zinc-200/80 dark:border-zinc-800/80">
          <div className="max-w-3xl mx-auto text-center glass-panel squircle p-10 md:p-14">
            <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4 text-balance">
              Prêt à faire le premier pas ?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
              Création de compte gratuite. Rejoignez la communauté de soutien émotionnel pour les jeunes d'Afrique — 100% anonyme, 100% bienveillant.
            </p>
            <Button onClick={onGetStarted} variant="secondary" className="group">
              Créer un compte gratuitement
              <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Button>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" aria-label="Contact" className="py-16 md:py-20 px-4 sm:px-6 bg-zinc-100/50 dark:bg-zinc-900/40">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3 text-center">
              Nous joindre
            </h2>
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-10">
              Une question sur la plateforme ? Un partenariat universitaire ou HealthTech à proposer ? Contactez-nous.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  id: 'email',
                  href: 'mailto:contact@annonyme.pro',
                  icon: EnvelopeSimple,
                  title: 'Email',
                  detail: 'contact@annonyme.pro',
                },
                {
                  id: 'wa',
                  href: 'https://wa.me/221777091913',
                  icon: ChatsCircle,
                  title: 'WhatsApp',
                  detail: '+221 77 709 19 13',
                },
                {
                  id: 'tel',
                  href: 'tel:+221777091913',
                  icon: Phone,
                  title: 'Téléphone',
                  detail: '+221 77 709 19 13',
                },
              ].map((c) => (
                <a
                  key={c.id}
                  href={c.href}
                  onMouseEnter={() => setContactHover(c.id)}
                  onMouseLeave={() => setContactHover(null)}
                  className={`block p-6 squircle-sm transition-premium active-squeeze focus-ring border ${
                    contactHover === c.id
                      ? 'border-accent-300/60 bg-white dark:bg-zinc-900 -translate-y-1 shadow-glow'
                      : 'border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/60'
                  }`}
                >
                  <IconBox icon={c.icon} tone={c.id === 'email' ? 'sky' : c.id === 'wa' ? 'sage' : 'peach'} className="mb-4" />
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{c.title}</h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{c.detail}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <div>
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Anonyme Pro</span>
            <p className="text-xs text-zinc-400 mt-1">Plateforme africaine de santé mentale & soutien émotionnel · Sénégal</p>
          </div>
          <nav className="flex gap-6" aria-label="Navigation pied de page">
            <button type="button" onClick={onContact} className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
              Contact
            </button>
            <span className="text-zinc-400">Confidentialité (bientôt)</span>
          </nav>
          <p>© {new Date().getFullYear()} Anonyme Pro</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
