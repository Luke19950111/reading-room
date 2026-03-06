import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { Book } from '@/types/book'
import { useBookDetail } from '@/hooks/useBookDetail'
import StarRating from '@/components/StarRating'
import Skeleton from '@/components/Skeleton'

interface BookDetailModalProps {
  book: Book | null
  onClose: () => void
}

export default function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  const { t } = useTranslation()
  const { data: detail, isLoading } = useBookDetail(book)

  useEffect(() => {
    if (book) {
      window.location.hash = `book/${book.id}`
      document.body.style.overflow = 'hidden'
    } else {
      if (window.location.hash.startsWith('#book/')) {
        history.replaceState(null, '', window.location.pathname + window.location.search)
      }
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [book])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {book && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative bg-white dark:bg-surface-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            role="dialog"
            aria-modal="true"
            aria-label={book.title}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-surface-100/80 dark:bg-surface-800/80 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              aria-label={t('common.close')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col sm:flex-row gap-6 p-6">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                {isLoading ? (
                  <Skeleton className="w-40 h-60 rounded-xl" />
                ) : (
                  <div className="w-40 rounded-xl overflow-hidden shadow-lg">
                    {detail?.coverUrl ? (
                      <img
                        src={detail.coverUrl}
                        alt={book.title}
                        className="w-full aspect-[2/3] object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center p-4">
                        <span className="text-white text-center font-bold text-sm">{book.title}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">
                    {book.title}
                  </h2>
                  {book.titleEn && (
                    <p className="text-sm text-surface-400 mt-0.5">{book.titleEn}</p>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <InfoRow label={t('book.author')} value={book.author} />
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </>
                  ) : (
                    <>
                      {detail?.publisher && (
                        <InfoRow label={t('book.publisher')} value={detail.publisher} />
                      )}
                      {detail?.publishedDate && (
                        <InfoRow label={t('book.publishDate')} value={detail.publishedDate} />
                      )}
                      {detail?.pageCount && (
                        <InfoRow
                          label={t('book.pages')}
                          value={`${detail.pageCount} ${t('book.pagesUnit')}`}
                        />
                      )}
                      {detail?.isbn && <InfoRow label={t('book.isbn')} value={detail.isbn} />}
                    </>
                  )}
                  {book.readDateStart && (
                    <InfoRow
                      label={t('book.readPeriod')}
                      value={`${book.readDateStart} ${t('common.to')} ${book.readDateEnd || '...'}`}
                    />
                  )}
                </div>

                {book.rating ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-surface-500">{t('book.rating')}</span>
                    <StarRating rating={book.rating} />
                  </div>
                ) : null}

                {book.tags?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {book.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : (
                <>
                  {detail?.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                        {t('book.description')}
                      </h3>
                      <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                        {detail.description}
                      </p>
                    </div>
                  )}
                </>
              )}

              {book.review && (
                <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
                  <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    {t('book.review')}
                  </h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed italic">
                    &ldquo;{book.review}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-surface-400 flex-shrink-0">{label}:</span>
      <span className="text-surface-700 dark:text-surface-300">{value}</span>
    </div>
  )
}
