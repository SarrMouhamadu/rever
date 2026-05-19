import { Moon, Sun } from '@phosphor-icons/react';

export default function ThemeToggle({ theme, onToggle, className = '' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      className={`p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-premium active-squeeze hover:scale-105 hover:border-teal-500/30 dark:hover:border-teal-400/30 focus-ring ${className} group`}
    >
      {theme === 'dark' ? (
        <Sun size={20} weight="duotone" className="transition-transform duration-500 group-hover:rotate-90 text-amber-500" />
      ) : (
        <Moon size={20} weight="duotone" className="transition-transform duration-500 group-hover:-rotate-12 text-teal-600 dark:text-teal-400" />
      )}
    </button>
  );
}
