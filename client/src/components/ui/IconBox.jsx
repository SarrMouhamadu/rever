export default function IconBox({ icon: Icon, className = '' }) {
  return (
    <div
      className={`w-12 h-12 rounded-2xl bg-teal-950/5 dark:bg-teal-400/10 border border-teal-900/10 dark:border-teal-500/20 flex items-center justify-center text-teal-700 dark:text-teal-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 hover:scale-110 hover:rotate-6 ${className}`}
    >
      <Icon size={24} weight="duotone" className="transition-transform duration-300 group-hover:scale-105" />
    </div>
  );
}
