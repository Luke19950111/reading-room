import { useQuery } from '@tanstack/react-query'
import type { Book, BookDetail } from '@/types/book'
import { enrichBookDetail } from '@/services/bookService'

export function useBookDetail(book: Book | null) {
  return useQuery<BookDetail>({
    queryKey: ['book-detail', book?.id],
    queryFn: () => enrichBookDetail(book!),
    enabled: !!book,
    staleTime: 30 * 60 * 1000,
  })
}
