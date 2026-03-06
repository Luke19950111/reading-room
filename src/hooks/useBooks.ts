import { useQuery } from '@tanstack/react-query'
import { useDeferredValue, useMemo } from 'react'
import type { Book } from '@/types/book'
import { fetchBooks } from '@/services/bookService'

export function useBooks() {
  return useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: fetchBooks,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFilteredBooks(
  books: Book[] | undefined,
  year: string | null,
  search: string,
) {
  const deferredSearch = useDeferredValue(search)

  return useMemo(() => {
    if (!books) return []

    let filtered = books

    if (year && year !== 'all') {
      filtered = filtered.filter((b) => {
        const start = b.readDateStart?.substring(0, 4)
        const end = b.readDateEnd?.substring(0, 4)
        return start === year || end === year
      })
    }

    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.titleEn?.toLowerCase().includes(q)) ||
          b.author.toLowerCase().includes(q),
      )
    }

    return filtered
  }, [books, year, deferredSearch])
}

export function useBookYears(books: Book[] | undefined): string[] {
  return useMemo(() => {
    if (!books) return []
    const years = new Set<string>()
    books.forEach((b) => {
      if (b.readDateStart) years.add(b.readDateStart.substring(0, 4))
    })
    return Array.from(years).sort().reverse()
  }, [books])
}
