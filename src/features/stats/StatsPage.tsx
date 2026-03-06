import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useBooks } from '@/hooks/useBooks'
import type { Book } from '@/types/book'

function getYearlyStats(books: Book[]) {
  const map = new Map<string, number>()
  books.forEach((b) => {
    if (b.status !== 'finished' || !b.readDateEnd) return
    const year = b.readDateEnd.substring(0, 4)
    map.set(year, (map.get(year) || 0) + 1)
  })
  return Array.from(map.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year))
}

function getMonthlyHeatmap(books: Book[]) {
  const map = new Map<string, number>()
  books.forEach((b) => {
    if (b.status !== 'finished' || !b.readDateEnd) return
    const key = b.readDateEnd.substring(0, 7)
    map.set(key, (map.get(key) || 0) + 1)
  })
  return map
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function StatsPage() {
  const { t } = useTranslation()
  const { data: books } = useBooks()

  const stats = useMemo(() => {
    if (!books) return { total: 0, thisYear: 0, avgPerMonth: '0', yearlyData: [], heatmap: new Map<string, number>() }

    const finished = books.filter((b) => b.status === 'finished')
    const currentYear = new Date().getFullYear().toString()
    const thisYear = finished.filter(
      (b) => b.readDateEnd?.startsWith(currentYear),
    ).length

    const yearlyData = getYearlyStats(books)
    const heatmap = getMonthlyHeatmap(books)

    const years = yearlyData.length || 1
    const avg = (finished.length / (years * 12)).toFixed(1)

    return { total: finished.length, thisYear, avgPerMonth: avg, yearlyData, heatmap }
  }, [books])

  const heatmapMonths = useMemo(() => {
    const months: Array<{ key: string; label: string; count: number }> = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = `${d.getMonth() + 1}`
      months.push({ key, label, count: stats.heatmap.get(key) || 0 })
    }
    return months
  }, [stats.heatmap])

  const statCards = [
    { label: t('stats.totalBooks'), value: stats.total, suffix: t('stats.booksUnit') },
    { label: t('stats.thisYear'), value: stats.thisYear, suffix: t('stats.booksUnit') },
    { label: t('stats.avgPerMonth'), value: stats.avgPerMonth, suffix: t('stats.booksUnit') },
  ]

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
        {t('stats.title')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            className="p-6 rounded-2xl bg-white dark:bg-surface-800 shadow-sm border border-surface-100 dark:border-surface-700"
          >
            <p className="text-sm text-surface-500 mb-1">{card.label}</p>
            <p className="text-3xl font-bold text-surface-900 dark:text-surface-100">
              {card.value}
              <span className="text-sm font-normal text-surface-400 ml-1">{card.suffix}</span>
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl bg-white dark:bg-surface-800 shadow-sm border border-surface-100 dark:border-surface-700"
      >
        <h3 className="text-lg font-semibold mb-4 text-surface-800 dark:text-surface-200">
          {t('stats.yearlyChart')}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-200)" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="count" fill="var(--color-primary-500)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl bg-white dark:bg-surface-800 shadow-sm border border-surface-100 dark:border-surface-700"
      >
        <h3 className="text-lg font-semibold mb-4 text-surface-800 dark:text-surface-200">
          {t('stats.monthlyHeatmap')}
        </h3>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
          {heatmapMonths.map((m) => (
            <div key={m.key} className="flex flex-col items-center gap-1">
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                  m.count === 0
                    ? 'bg-surface-100 dark:bg-surface-700 text-surface-400'
                    : m.count <= 1
                      ? 'bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-200'
                      : m.count <= 3
                        ? 'bg-primary-400 dark:bg-primary-600 text-white'
                        : 'bg-primary-600 dark:bg-primary-400 text-white'
                }`}
              >
                {m.count}
              </div>
              <span className="text-[10px] text-surface-400">{m.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
