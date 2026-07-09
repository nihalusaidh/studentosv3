export default function PageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4 animate-pulse">
      <div className="h-6 w-48 rounded-lg bg-[var(--bg-secondary)]" />
      <div className="h-4 w-72 rounded-lg bg-[var(--bg-secondary)]" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-[var(--bg-secondary)]" />)}
      </div>
      <div className="h-3 w-full rounded-lg bg-[var(--bg-secondary)]" />
      <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-[var(--bg-secondary)]" />)}
      </div>
    </div>
  )
}