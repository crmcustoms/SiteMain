export function RecentProjects() {
  const projects = [
    { name: "Меблева ВМКК", metric: "+40%", positive: true },
    { name: "PR ITComms", metric: "-70%", positive: false },
    { name: "Кредитна", metric: "+60%", positive: true },
  ]

  return (
    <div className="absolute bottom-10 right-10 z-20 bg-white/95 backdrop-blur-md border border-black/10 rounded-lg p-5 min-w-[280px] shadow-2xl animate-in fade-in slide-in-from-bottom duration-1000">
      <div className="font-mono text-[10px] tracking-[2px] uppercase text-[#FFD700] mb-4 flex items-center gap-2">
        <span className="inline-block">━━━</span> RECENT PROJECTS
      </div>

      <div className="space-y-3">
        {projects.map((project, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-black/10 last:border-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-black">▸</span>
              {project.name}
            </div>
            <div className={`font-mono text-sm font-bold ${project.positive ? "text-[#00ff00]" : "text-[#FFD700]"}`}>
              {project.metric}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
