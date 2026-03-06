const spineColors = [
  { bg: 'from-sky-700 to-sky-900', spine: 'bg-sky-950' },
  { bg: 'from-emerald-700 to-emerald-900', spine: 'bg-emerald-950' },
  { bg: 'from-violet-700 to-violet-900', spine: 'bg-violet-950' },
  { bg: 'from-rose-700 to-rose-900', spine: 'bg-rose-950' },
  { bg: 'from-amber-700 to-amber-900', spine: 'bg-amber-950' },
  { bg: 'from-indigo-700 to-indigo-900', spine: 'bg-indigo-950' },
]

interface BookCoverFallbackProps {
  title: string
  author: string
  index?: number
  className?: string
}

export default function BookCoverFallback({
  title,
  author,
  index = 0,
  className = '',
}: BookCoverFallbackProps) {
  const color = spineColors[index % spineColors.length]

  return (
    <div className={`w-full h-full relative ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${color.bg}`} />
      <div className={`absolute left-0 top-0 bottom-0 w-[6%] ${color.spine} opacity-60`} />
      <div className="absolute top-[8%] left-[12%] right-[8%] bottom-[12%] border border-white/20 rounded-sm flex flex-col items-center justify-center p-3 gap-2">
        <div className="w-8 h-px bg-white/40" />
        <h4 className="text-white text-center font-bold text-xs sm:text-sm leading-tight drop-shadow-md line-clamp-3">
          {title}
        </h4>
        <div className="w-8 h-px bg-white/40" />
        <p className="text-white/70 text-center text-[10px] leading-tight mt-auto line-clamp-2">
          {author}
        </p>
      </div>
    </div>
  )
}
