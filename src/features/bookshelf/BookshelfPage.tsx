import { useState, useTransition } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useBooks, useFilteredBooks, useBookYears } from '@/hooks/useBooks'
import BookCard from './BookCard'
import YearFilter from './YearFilter'
import SearchBar from './SearchBar'
import { BookCardSkeleton } from '@/components/Skeleton'
import type { Book } from '@/types/book'

interface BookshelfPageProps {
  onBookSelect: (book: Book) => void
}

export default function BookshelfPage({ onBookSelect }: BookshelfPageProps) {
  const { t } = useTranslation()
  const { data: books, isLoading, error, refetch } = useBooks()
  const years = useBookYears(books)
  const [selectedYear, setSelectedYear] = useState('all')
  const [search, setSearch] = useState('')
  const [, startTransition] = useTransition()
  const filteredBooks = useFilteredBooks(books, selectedYear, search)

  const handleYearChange = (year: string) => {
    startTransition(() => {
      setSelectedYear(year)
    })
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-surface-500">{t('common.error')}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <YearFilter years={years} selected={selectedYear} onChange={handleYearChange} />
        <div className="w-full sm:w-64">
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }, (_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20 text-surface-400">
          <p>{t('search.noResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBooks.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} onClick={onBookSelect} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
