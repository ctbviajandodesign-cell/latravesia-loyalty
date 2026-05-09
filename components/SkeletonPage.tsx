export default function SkeletonPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="p-6 bg-travesia-cream rounded-full">
        <div className="w-16 h-16 border-4 border-travesia-gold border-t-transparent rounded-full animate-spin" />
      </div>
      <h1 className="text-3xl font-bold text-travesia-green-deep">{title}</h1>
      <p className="text-travesia-green-dark/60">Esta sección estará disponible próximamente.</p>
    </div>
  );
}
