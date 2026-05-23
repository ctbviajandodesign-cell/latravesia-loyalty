export default function DashboardLoading() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded-[32px] bg-white/5 border border-white/5" />
        ))}
      </div>
      {/* Table skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 h-96 rounded-[40px] bg-white/5 border border-white/5" />
        <div className="h-96 rounded-[40px] bg-white/5 border border-white/5" />
      </div>
    </div>
  );
}
