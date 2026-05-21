import ThemeToggle from '../components/ui/ThemeToggle';
import Button from '../components/ui/Button';

const inputClass =
  'w-full bg-canvas dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-base md:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-ring focus-glow transition-colors';

export default function AuthScreen({
  view,
  setView,
  authForm,
  setAuthForm,
  authError,
  onLogin,
  onRegister,
  theme,
  toggleTheme,
}) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 relative">
      <div aria-hidden className="grain" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 right-0 w-[28rem] h-[28rem] ambient-blob-accent rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 ambient-blob-sky rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 ambient-blob-lavender rounded-full blur-3xl opacity-80" />
      </div>

      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-4xl shadow-soft dark:shadow-soft-dark z-10 animate-slide-up">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-600 dark:text-accent-400 mb-1">
              Anonyme Pro
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 text-balance">
              {view === 'login' ? 'Bon retour parmi nous' : 'Créer votre espace'}
            </h1>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        {authError && (
          <p role="alert" className="mb-5 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 rounded-xl">
            {authError}
          </p>
        )}

        {view === 'login' ? (
          <form onSubmit={onLogin} className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block">
                Pseudo, email ou téléphone
              </span>
              <input
                type="text"
                required
                className={inputClass}
                value={authForm.loginId}
                onChange={(e) => setAuthForm({ ...authForm, loginId: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block">
                Mot de passe
              </span>
              <input
                type="password"
                required
                className={inputClass}
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </label>
            <Button type="submit" className="w-full mt-2">
              Se connecter
            </Button>
            <p className="text-center text-sm text-zinc-500 pt-2">
              Pas de compte ?{' '}
              <button
                type="button"
                onClick={() => setView('register')}
                className="text-link"
              >
                S&apos;inscrire
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={onRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-zinc-500 mb-1.5 block">Prénom</span>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={authForm.firstName}
                  onChange={(e) => setAuthForm({ ...authForm, firstName: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-zinc-500 mb-1.5 block">Nom</span>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={authForm.lastName}
                  onChange={(e) => setAuthForm({ ...authForm, lastName: e.target.value })}
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-zinc-500 mb-1.5 block">Email ou téléphone</span>
              <input
                type="text"
                required
                className={inputClass}
                value={authForm.contact}
                onChange={(e) => setAuthForm({ ...authForm, contact: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-500 mb-1.5 block">Pseudo public</span>
              <input
                type="text"
                required
                className={inputClass}
                value={authForm.pseudo}
                onChange={(e) => setAuthForm({ ...authForm, pseudo: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-500 mb-1.5 block">Mot de passe (8 car. min.)</span>
              <input
                type="password"
                required
                minLength={8}
                className={inputClass}
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </label>
            <Button type="submit" className="w-full mt-2">
              Créer mon compte
            </Button>
            <p className="text-center text-sm text-zinc-500 pt-2">
              Déjà inscrit ?{' '}
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-link"
              >
                Se connecter
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
