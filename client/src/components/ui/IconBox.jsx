export default function IconBox({ icon: Icon, className = '' }) {
  return (
    <div
      className={`w-12 h-12 squircle-sm bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 transition-all duration-300 group-hover:scale-110 hover:scale-110 ${className}`}
    >
      <Icon size={24} weight="regular" className="transition-transform duration-300 group-hover:scale-105" />
    </div>
  );
}
