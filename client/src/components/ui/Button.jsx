export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-premium focus-ring active-squeeze disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary:
      'px-6 py-3 bg-teal-700 text-white hover:bg-teal-600 shadow-soft dark:shadow-soft-dark',
    secondary:
      'px-6 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90',
    ghost:
      'px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80',
    outline:
      'px-6 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-teal-600/50 hover:bg-teal-50/50 dark:hover:bg-teal-950/20',
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
