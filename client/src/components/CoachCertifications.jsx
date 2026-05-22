import { useState } from 'react';
import { Certificate, CaretDown, ShieldCheck, SealCheck, CalendarBlank, Buildings } from '@phosphor-icons/react';
import { COACH_CERTIFICATIONS, COACH_CERT_INTRO } from '../data/coachCertifications';

const toneStyles = {
  lavender: {
    card: 'border-l-[3px] border-l-live-lavender bg-live-lavender-muted/40 dark:bg-live-lavender-dark/15 border-live-lavender/20 dark:border-live-lavender/25',
    badge: 'chip-live-lavender',
    icon: 'text-live-lavender-dark dark:text-live-lavender bg-white/80 dark:bg-zinc-900/50 border-live-lavender/30',
    accent: 'text-live-lavender-dark dark:text-live-lavender',
  },
  sky: {
    card: 'border-l-[3px] border-l-live-sky bg-live-sky-muted/40 dark:bg-live-sky-dark/15 border-live-sky/20 dark:border-live-sky/25',
    badge: 'chip-live-sky',
    icon: 'text-live-sky-dark dark:text-live-sky bg-white/80 dark:bg-zinc-900/50 border-live-sky/30',
    accent: 'text-live-sky-dark dark:text-live-sky',
  },
};

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <Icon size={18} weight="duotone" className="shrink-0 text-zinc-400 dark:text-zinc-500 mt-0.5" aria-hidden />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</p>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{value}</p>
      </div>
    </div>
  );
}

function CertCard({ cert, index, compact }) {
  const style = toneStyles[cert.tone] || toneStyles.lavender;

  if (compact) {
    return (
      <article className={`rounded-2xl border p-4 ${style.card}`}>
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${style.accent}`}>
          Certificat {index + 1}
        </p>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-snug">{cert.title}</p>
        {cert.subtitle && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{cert.subtitle}</p>
        )}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{cert.issuer}</span>
          {' · '}
          {cert.issuedLabel}
        </p>
      </article>
    );
  }

  return (
    <article
      className={`rounded-2xl border shadow-sm overflow-hidden transition-premium hover:shadow-md ${style.card}`}
    >
      <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-zinc-200/50 dark:border-zinc-700/40 bg-white/50 dark:bg-zinc-900/30 flex flex-wrap items-center justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${style.badge}`}>
          <SealCheck size={16} weight="fill" />
          Certificat vérifié
        </span>
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tabular-nums">
          N° {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex gap-4 items-start mb-5">
          <div
            className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border ${style.icon}`}
            aria-hidden
          >
            <Certificate size={28} weight="duotone" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight">
              {cert.title}
            </h3>
            {cert.subtitle && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">{cert.subtitle}</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-5 p-4 rounded-xl bg-white/60 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
          <MetaRow icon={Buildings} label="Organisme certificateur" value={cert.issuer} />
          <MetaRow icon={CalendarBlank} label="Date de délivrance" value={cert.issuedLabel} />
        </div>

        {cert.skills?.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Compétences validées
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Compétences validées">
              {cert.skills.map((skill) => (
                <li key={skill}>
                  <span
                    className={`inline-block text-xs font-medium leading-snug px-3 py-1.5 rounded-lg ${style.badge}`}
                  >
                    {skill}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

/** Section complète (landing, paramètres) */
export function CoachCertificationsSection({ embedded = false }) {
  return (
    <section aria-label="Certifications des coachs" className={embedded ? '' : ''}>
      <div className="text-center md:text-left mb-8 md:mb-10 max-w-3xl md:max-w-none mx-auto">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] chip-live-sage px-4 py-2 rounded-full mb-4">
          <ShieldCheck size={16} weight="duotone" />
          Confiance & conformité
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 text-balance">
          Certifications de nos coachs
        </h2>
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl md:max-w-3xl">
          {COACH_CERT_INTRO}
        </p>
      </div>

      <div className="flex flex-col gap-5 md:gap-6 max-w-4xl md:max-w-none mx-auto">
        {COACH_CERTIFICATIONS.map((cert, index) => (
          <CertCard key={cert.id} cert={cert} index={index} />
        ))}
      </div>

      <p className="mt-6 text-center md:text-left text-xs text-zinc-500 dark:text-zinc-500 max-w-2xl">
        Ces certifications attestent de la formation de nos coachs en protection des données et en respect
        de la confidentialité de vos échanges.
      </p>
    </section>
  );
}

/** Bandeau repliable dans le chat avec un coach */
export function CoachCertificationsBanner({ className = '' }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`mx-3 sm:mx-4 mb-2 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-live-lavender/30 dark:border-live-lavender/25 bg-live-lavender-muted/70 dark:bg-live-lavender-dark/15 text-left transition-premium active-squeeze-sm hover:bg-live-lavender-muted"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="shrink-0 w-9 h-9 rounded-xl bg-white/90 dark:bg-zinc-900/60 border border-live-lavender/25 flex items-center justify-center">
            <ShieldCheck size={20} weight="duotone" className="text-live-lavender-dark dark:text-live-lavender" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Coach certifié
            </span>
            <span className="block text-xs text-zinc-600 dark:text-zinc-400 truncate">
              RGPD · Alison & CALP Network
            </span>
          </span>
        </span>
        <CaretDown
          size={18}
          className={`shrink-0 text-live-lavender-dark dark:text-live-lavender transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="mt-2 space-y-2 animate-fade-in">
          {COACH_CERTIFICATIONS.map((cert, index) => (
            <CertCard key={cert.id} cert={cert} index={index} compact />
          ))}
        </div>
      )}
    </div>
  );
}

/** Badges compacts (liste coachs) */
export function CoachCertBadges({ className = '' }) {
  return (
    <span className={`inline-flex flex-wrap gap-1 ${className}`} title="Certifié RGPD">
      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full chip-live-lavender">
        <SealCheck size={10} weight="fill" />
        RGPD
      </span>
    </span>
  );
}
