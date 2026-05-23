export default function ClientesLoading() {
  return (
    <div className="space-y-8 animate-pulse pb-20">
      <div className="flex items-center justify-between">
        <div className="h-10 w-64 rounded-2xl bg-white/5" />
        <div className="h-10 w-36 rounded-2xl bg-white/5" />
      </div>
      <div className="h-16 rounded-[32px] bg-white/5" />
      <div className="rounded-[40px] bg-[#0A2A18]/40 border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="p-8"><div className="h-3 w-16 bg-white/5 rounded" /></th>
              <th className="p-8"><div className="h-3 w-12 bg-white/5 rounded mx-auto" /></th>
              <th className="p-8"><div className="h-3 w-20 bg-white/5 rounded ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="p-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-white/5 rounded" />
                      <div className="h-3 w-56 bg-white/5 rounded" />
                    </div>
                  </div>
                </td>
                <td className="p-8"><div className="h-8 w-12 bg-white/5 rounded mx-auto" /></td>
                <td className="p-8">
                  <div className="flex justify-end gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5" />
                    <div className="w-10 h-10 rounded-xl bg-white/5" />
                    <div className="w-10 h-10 rounded-xl bg-white/5" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
