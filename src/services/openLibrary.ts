import type { OpenLibrarySearchResponse, BookDetail } from '@/types/book'

const SEARCH_URL = 'https://openlibrary.org/search.json'
const COVER_URL = 'https://covers.openlibrary.org'

export async function searchOpenLibrary(query: string): Promise<BookDetail | null> {
  try {
    const res = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=1`)
    if (!res.ok) return null

    const data: OpenLibrarySearchResponse = await res.json()
    if (!data.docs?.length) return null

    const doc = data.docs[0]
    const coverId = doc.cover_i
    const coverUrl = coverId ? `${COVER_URL}/b/id/${coverId}-L.jpg` : undefined

    return {
      id: '',
      title: doc.title,
      author: doc.author_name?.join(', ') ?? '',
      coverUrl,
      publisher: doc.publisher?.[0],
      publishedDate: doc.first_publish_year?.toString(),
      pageCount: doc.number_of_pages_median,
      isbn: doc.isbn?.[0],
      status: 'finished',
    }
  } catch {
    return null
  }
}

export function getOpenLibraryCoverByISBN(isbn: string, size: 'S' | 'M' | 'L' = 'L'): string {
  return `${COVER_URL}/b/isbn/${isbn}-${size}.jpg`
}
