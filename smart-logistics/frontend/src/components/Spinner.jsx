export default function Spinner({ fullscreen }) {
  if (fullscreen) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin inline-block" />;
}
