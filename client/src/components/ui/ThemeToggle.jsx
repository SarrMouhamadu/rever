import { Moon, Sun } from '@phosphor-icons/react';

export default function ThemeToggle({ theme, onToggle, className = '' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      className={`p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors focus-ring ${className}`}
    >
      {theme === 'dark' ? <Sun size={20} weight="duotone" /> : <Moon size={20} weight="duotone" />}
    </button>
  );
}
