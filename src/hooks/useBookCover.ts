import { useQuery } from '@tanstack/react-query'
import type { Book } from '@/types/book'
import { fetchBookCover } from '@/services/bookService'

export function useBookCover(book: Book) {
  return useQuery({
    queryKey: ['book-cover', book.id],
    queryFn: () => fetchBookCover(book),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })
}
