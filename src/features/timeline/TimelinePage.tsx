import { useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useRef } from 'react'
import { useBooks } from '@/hooks/useBooks'
import StarRating from '@/components/StarRating'
import type { Book } from '@/types/book'

function TimelineItem({ book, index }: { book: Book; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const isLeft = index % 2 === 0

  return (
    <div ref={ref}>
      {/* Desktop: alternating left/right */}
      <div
        className={`hidden md:flex items-start gap-8 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
      >
        <motion.div
          className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}
          initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <TimelineCard book={book} />
        </motion.div>

        <TimelineDot isInView={isInView} date={book.readDateEnd || book.readDateStart || ''} />

        <div className="flex-1" />
      </div>

      {/* Mobile: dot left, card right */}
      <div className="flex md:hidden items-start gap-4">
        <TimelineDot isInView={isInView} date={book.readDateEnd || book.readDateStart || ''} />

        <motion.div
          className="flex-1 min-w-0"
          initial={{ opacity: 0, x: 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <TimelineCard book={book} />
        </motion.div>
      </div>
    </div>
  )
}

function TimelineDot({ isInView, date }: { isInView: boolean; date: string }) {
  return (
    <div className="flex flex-col items-center flex-shrink-0 w-10 relative z-10">
      <motion.div
        className="w-4 h-4 rounded-full bg-primary-500 border-4 border-primary-100 dark:border-primary-900 shadow-md"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 300, delay: 0.05 }}
      />
      <motion.div
        className="text-[10px] text-surface-400 mt-1 whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.2 }}
      >
        {date}
      </motion.div>
    </div>
  )
}

function TimelineCard({ book }: { book: Book }) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-surface-800 shadow-sm border border-surface-100 dark:border-surface-700 inline-block max-w-sm">
      <h3 className="font-semibold text-surface-900 dark:text-surface-100">{book.title}</h3>
      {book.titleEn && (
        <p className="text-xs text-surface-400 mt-0.5">{book.titleEn}</p>
      )}
      <p className="text-sm text-surface-500 mt-1">{book.author}</p>
      {book.rating ? (
        <div className="mt-2">
          <StarRating rating={book.rating} size="sm" />
        </div>
      ) : null}
      {book.review && (
        <p className="text-xs text-surface-400 mt-2 italic line-clamp-2">
          &ldquo;{book.review}&rdquo;
        </p>
      )}
    </div>
  )
}

export default function TimelinePage() {
  const { t } = useTranslation()
  const { data: books } = useBooks()

  const sortedBooks = useMemo(() => {
    if (!books) return []
    return [...books]
      .filter((b) => b.readDateStart)
      .sort((a, b) => {
        const dateA = a.readDateEnd || a.readDateStart || ''
        const dateB = b.readDateEnd || b.readDateStart || ''
        return dateB.localeCompare(dateA)
      })
  }, [books])

  return (
    <div className="space-y-6">
      <motion.h2
        className="text-2xl font-bold text-surface-900 dark:text-surface-100"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {t('timeline.title')}
      </motion.h2>

      <div className="relative">
        {/* Desktop center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-surface-200 dark:bg-surface-700 hidden md:block" />
        {/* Mobile left line - aligned to dot center (w-10 / 2 = 20px) */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-surface-200 dark:bg-surface-700 md:hidden" />

        <div className="space-y-8">
          {sortedBooks.map((book, i) => (
            <TimelineItem key={book.id} book={book} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
