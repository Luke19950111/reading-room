import { lazy, Suspense, useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from '@/components/Layout'
import ErrorBoundary from '@/components/ErrorBoundary'
import BookshelfPage from '@/features/bookshelf/BookshelfPage'
import BookDetailModal from '@/features/book-detail/BookDetailModal'
import type { Book } from '@/types/book'

const StatsPage = lazy(() => import('@/features/stats/StatsPage'))
const TimelinePage = lazy(() => import('@/features/timeline/TimelinePage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AppRoutes() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  const handleBookSelect = useCallback((book: Book) => {
    setSelectedBook(book)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedBook(null)
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      if (!window.location.hash.startsWith('#book/')) {
        setSelectedBook(null)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<BookshelfPage onBookSelect={handleBookSelect} />} />
          <Route
            path="stats"
            element={
              <Suspense fallback={<PageFallback />}>
                <StatsPage />
              </Suspense>
            }
          />
          <Route
            path="timeline"
            element={
              <Suspense fallback={<PageFallback />}>
                <TimelinePage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
      <BookDetailModal book={selectedBook} onClose={handleClose} />
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter basename="/ReadingRoom">
          <AppRoutes />
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
