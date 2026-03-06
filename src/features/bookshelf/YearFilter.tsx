import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useRef, useEffect, useState } from 'react'

interface YearFilterProps {
  years: string[]
  selected: string
  onChange: (year: string) => void
}

export default function YearFilter({ years, selected, onChange }: YearFilterProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const activeBtn = container.querySelector<HTMLButtonElement>('[data-active="true"]')
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      })
    }
  }, [selected])

  const tabs = [{ value: 'all', label: t('filter.all') }, ...years.map((y) => ({ value: y, label: y }))]

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-1 overflow-x-auto scrollbar-none p-1 rounded-xl bg-surface-100 dark:bg-surface-800/50">
        {indicatorStyle.width > 0 && (
          <motion.div
            className="absolute top-1 h-[calc(100%-8px)] rounded-lg bg-white dark:bg-surface-700 shadow-sm"
            layoutId="yearIndicator"
            animate={indicatorStyle}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        {tabs.map((tab) => (
          <button
            key={tab.value}
            data-active={selected === tab.value}
            onClick={() => onChange(tab.value)}
            className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              selected === tab.value
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
