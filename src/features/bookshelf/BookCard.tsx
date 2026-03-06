import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { Book } from '@/types/book'
import { useState } from 'react'
import { useBookCover } from '@/hooks/useBookCover'

interface BookCardProps {
  book: Book
  index: number
  onClick: (book: Book) => void
}

const placeholderColors = [
  'from-primary-400 to-primary-600',
  'from-emerald-400 to-emerald-600',
  'from-violet-400 to-violet-600',
  'from-rose-400 to-rose-600',
  'from-amber-400 to-amber-600',
]

export default function BookCard({ book, index, onClick }: BookCardProps) {
  const { t } = useTranslation()
  const [imgError, setImgError] = useState(false)
  const { data: coverUrl, isLoading: coverLoading } = useBookCover(book)
  const colorClass = placeholderColors[index % placeholderColors.length]

  const resolvedCover = book.coverUrl || coverUrl

  const statusLabel =
    book.status === 'reading'
      ? t('book.statusReading')
      : book.status === 'finished'
        ? t('book.statusFinished')
        : t('book.statusWishlist')

  const statusColor =
    book.status === 'reading'
      ? 'bg-green-500'
      : book.status === 'finished'
        ? 'bg-primary-500'
        : 'bg-surface-400'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group cursor-pointer"
      onClick={() => onClick(book)}
      role="button"
      tabIndex={0}
      aria-label={`${book.title} - ${book.author}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(book)
        }
      }}
    >
      <div className="relative overflow-hidden rounded-xl shadow-md group-hover:shadow-xl transition-shadow duration-300">
        <motion.div
          className="aspect-[2/3] relative"
          whileHover={{ scale: 1.03, rotateY: 3 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{ transformStyle: 'preserve-3d', perspective: 800 }}
        >
          {coverLoading ? (
            <div className="w-full h-full animate-pulse bg-surface-200 dark:bg-surface-700" />
          ) : resolvedCover && !imgError ? (
            <img
              src={resolvedCover}
              alt={book.title}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${colorClass} flex items-center justify-center p-4`}
            >
              <span className="text-white text-center font-bold text-sm leading-tight drop-shadow-md">
                {book.title}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

        <div
          className={`absolute top-2 right-2 ${statusColor} text-white text-[10px] px-2 py-0.5 rounded-full font-medium`}
        >
          {statusLabel}
        </div>
      </div>

      <div className="mt-2 px-1">
        <h3 className="text-sm font-semibold truncate text-surface-800 dark:text-surface-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-surface-500 truncate mt-0.5">{book.author}</p>
      </div>
    </motion.article>
  )
}
