import { useState } from 'react';
import { ArrowLeft, Lightbulb, Wrench, Heart, EnvelopeSimple, ChatsCircle, Phone } from '@phosphor-icons/react';
import api from './api/client';
import Button from './components/ui/Button';
import ThemeToggle from './components/ui/ThemeToggle';
import IconBox from './components/ui/IconBox';

const inputClass =
  'w-full bg-stone-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-base md:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-glow-teal';

function ContactPage({ onBack, onGetStarted, theme, toggleTheme }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      await api.post('/api/contact', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Envoi impossible. Réessayez dans un instant.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative">
      <div aria-hidden className="grain" />

      <header className="sticky top-0 z-40 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-premium active-squeeze hover:scale-105 focus-ring rounded-lg px-2 py-1 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
            Retour
          </button>
          <span className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">Anonyme Pro</span>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <Button onClick={onGetStarted} className="!px-4 !py-2 text-sm hidden sm:inline-flex">
              Connexion
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-14 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 text-balance">
            Restons en contact
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[65ch]">
            Une question, une suggestion ou un souci technique — écrivez-nous. Nous lisons chaque message.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {[
            { icon: Lightbulb, title: 'Suggestions', text: 'Idées pour améliorer la plateforme.' },
            { icon: Wrench, title: 'Support', text: 'Difficulté avec votre compte ou l’app.' },
            { icon: Heart, title: 'Retour', text: 'Ce qui vous aide au quotidien.' },
          ].map((item) => (
            <div key={item.title} className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 hover-lift-premium group">
              <IconBox icon={item.icon} className="mb-3 !w-10 !h-10" />
              <h2 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{item.title}</h2>
              <p className="text-xs text-zinc-500 mt-1">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Coordonnées</h2>
            {[
              { href: 'mailto:contact@annonyme.pro', icon: EnvelopeSimple, label: 'Email', value: 'contact@annonyme.pro' },
              { href: 'https://wa.me/221777091913', icon: ChatsCircle, label: 'WhatsApp', value: '+221 77 709 19 13' },
              { href: 'tel:+221777091913', icon: Phone, label: 'Téléphone', value: '+221 77 709 19 13' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex gap-4 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-teal-600/30 transition-premium active-squeeze hover-lift-premium shadow-sm focus-ring group"
              >
                <IconBox icon={link.icon} className="!w-10 !h-10 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500">{link.label}</p>
                  <p className="font-medium text-teal-800 dark:text-teal-300">{link.value}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="glass-panel p-6 md:p-8 rounded-3xl">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Message</h2>
            {success && (
              <p className="mb-4 text-sm text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/50 rounded-xl px-4 py-3 animate-spring-pop">
                Message reçu. Nous vous répondrons sous 24 h ouvrées.
              </p>
            )}
            {error && (
              <p role="alert" className="mb-4 text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 rounded-xl px-4 py-3 animate-spring-pop">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-zinc-500 mb-1.5 block">Nom</span>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-zinc-500 mb-1.5 block">Email</span>
                <input
                  type="email"
                  required
                  className={inputClass}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-zinc-500 mb-1.5 block">Message</span>
                <textarea
                  required
                  rows={5}
                  className={`${inputClass} resize-none`}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </label>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Envoi…' : 'Envoyer'}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ContactPage;
