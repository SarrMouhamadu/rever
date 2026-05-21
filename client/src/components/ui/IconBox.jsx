const toneClasses = {
  accent: 'bg-accent-50 dark:bg-accent-950/40 border-accent-200/60 dark:border-accent-800/50 text-accent-600 dark:text-accent-400',
  sky: 'bg-live-sky-muted dark:bg-live-sky-dark/25 border-live-sky/30 dark:border-live-sky/25 text-live-sky-dark dark:text-live-sky',
  coral: 'bg-live-coral-muted dark:bg-live-coral-dark/25 border-live-coral/30 dark:border-live-coral/25 text-live-coral-dark dark:text-live-coral',
  lavender: 'bg-live-lavender-muted dark:bg-live-lavender-dark/25 border-live-lavender/30 dark:border-live-lavender/25 text-live-lavender-dark dark:text-live-lavender',
  sage: 'bg-live-sage-muted dark:bg-live-sage-dark/25 border-live-sage/30 dark:border-live-sage/25 text-live-sage-dark dark:text-live-sage',
  peach: 'bg-live-peach-muted dark:bg-live-peach-dark/25 border-live-peach/30 dark:border-live-peach/25 text-live-peach-dark dark:text-live-peach',
};

export default function IconBox({ icon: Icon, tone = 'accent', className = '' }) {
  return (
    <div
      className={`w-12 h-12 squircle-sm flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${toneClasses[tone] || toneClasses.accent} ${className}`}
    >
      <Icon size={24} weight="regular" />
    </div>
  );
}
