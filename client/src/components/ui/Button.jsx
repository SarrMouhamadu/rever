export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-premium focus-ring active-squeeze disabled:opacity-50 disabled:pointer-events-none tracking-tight';

  const variants = {
    primary:
      'px-6 py-3 bg-accent-600 text-white hover:bg-accent-500 dark:bg-accent-500 dark:hover:bg-accent-400 shadow-sm shadow-accent-600/15',
    secondary:
      'px-6 py-3 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-200/90 dark:hover:bg-zinc-700',
    ghost:
      'px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100',
    outline:
      'px-6 py-3 border border-zinc-300/80 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-accent-300 dark:hover:border-accent-600/50 hover:bg-accent-50/50 dark:hover:bg-accent-950/30',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
