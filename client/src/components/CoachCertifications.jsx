import { useState } from 'react';
import { Certificate, CaretDown, ShieldCheck } from '@phosphor-icons/react';
import { COACH_CERTIFICATIONS, COACH_CERT_INTRO } from '../data/coachCertifications';

const toneChip = {
  lavender: 'chip-live-lavender',
  sky: 'chip-live-sky',
  coral: 'chip-live-coral',
  sage: 'chip-live-sage',
};

const toneIcon = {
  lavender: 'text-live-lavender-dark dark:text-live-lavender bg-live-lavender-muted dark:bg-live-lavender-dark/25 border-live-lavender/30',
  sky: 'text-live-sky-dark dark:text-live-sky bg-live-sky-muted dark:bg-live-sky-dark/25 border-live-sky/30',
  coral: 'text-live-coral-dark dark:text-live-coral bg-live-coral-muted dark:bg-live-coral-dark/25 border-live-coral/30',
  sage: 'text-live-sage-dark dark:text-live-sage bg-live-sage-muted dark:bg-live-sage-dark/25 border-live-sage/30',
};

function CertCard({ cert, compact }) {
  const chip = toneChip[cert.tone] || toneChip.lavender;
  const iconWrap = toneIcon[cert.tone] || toneIcon.lavender;

  return (
    <article
      className={`glass-panel squircle border-zinc-200/70 dark:border-zinc-800/70 transition-premium hover-lift-premium ${
        compact ? 'p-4' : 'p-6 md:p-7'
      }`}
    >
      <div className="flex gap-4 items-start">
        <div
          className={`shrink-0 w-11 h-11 squircle-sm flex items-center justify-center border ${iconWrap}`}
          aria-hidden
        >
          <Certificate size={22} weight="duotone" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-zinc-900 dark:text-zinc-50 leading-snug ${compact ? 'text-sm' : 'text-base'}`}>
            {cert.title}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Certifié par <span className="font-medium text-zinc-700 dark:text-zinc-300">{cert.issuer}</span>
            {' · '}
            <time dateTime={`${cert.issuedAt}-01`}>Délivré {cert.issuedLabel}</time>
          </p>
          {!compact && cert.skills?.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 mt-4" aria-label="Compétences">
              {cert.skills.map((skill) => (
                <li key={skill}>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${chip}`}>
                    {skill}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

/** Section complète (landing, paramètres) */
export function CoachCertificationsSection({ className = '' }) {
  return (
    <section aria-label="Certifications des coachs" className={className}>
      <div className="flex items-start gap-3 mb-6 md:mb-8">
        <div className="w-12 h-12 squircle-sm chip-live-sage flex items-center justify-center shrink-0">
          <ShieldCheck size={26} weight="duotone" className="text-live-sage-dark dark:text-live-sage" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-400 mb-1">
            Confiance & conformité
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 text-balance">
            Certifications de nos coachs
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            {COACH_CERT_INTRO}
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4 md:gap-5">
        {COACH_CERTIFICATIONS.map((cert) => (
          <CertCard key={cert.id} cert={cert} />
        ))}
      </div>
    </section>
  );
}

/** Bandeau repliable dans le chat avec un coach */
export function CoachCertificationsBanner({ className = '' }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`mx-4 mb-2 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-live-lavender/25 dark:border-live-lavender/20 bg-live-lavender-muted/50 dark:bg-live-lavender-dark/10 text-left transition-premium active-squeeze-sm hover:bg-live-lavender-muted/80 dark:hover:bg-live-lavender-dark/20"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-live-lavender-dark dark:text-live-lavender">
          <ShieldCheck size={18} weight="duotone" />
          Coach certifié RGPD & protection des données
        </span>
        <CaretDown
          size={16}
          className={`shrink-0 text-live-lavender-dark dark:text-live-lavender transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="mt-2 space-y-2 animate-fade-in">
          {COACH_CERTIFICATIONS.map((cert) => (
            <CertCard key={cert.id} cert={cert} compact />
          ))}
        </div>
      )}
    </div>
  );
}

/** Badges compacts (liste coachs) */
export function CoachCertBadges({ className = '' }) {
  return (
    <span className={`inline-flex flex-wrap gap-1 ${className}`}>
      {COACH_CERTIFICATIONS.map((cert) => (
        <span
          key={cert.id}
          className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${toneChip[cert.tone] || toneChip.lavender}`}
          title={`${cert.title} — ${cert.issuer}`}
        >
          {cert.issuer === 'Alison' ? 'RGPD' : 'Données'}
        </span>
      ))}
    </span>
  );
}
