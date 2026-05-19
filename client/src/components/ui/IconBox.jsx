export default function IconBox({ icon: Icon, className = '' }) {
  return (
    <div
      className={`w-12 h-12 squircle-sm bg-teal-950/5 dark:bg-teal-400/10 border-teal-900/10 dark:border-teal-500/20 flex items-center justify-center text-teal-700 dark:text-teal-400 transition-all duration-300 group-hover:scale-110 hover:scale-110 ${className}`}
    >
      <Icon size={24} weight="regular" className="transition-transform duration-300 group-hover:scale-105" />
    </div>
  );
}
