import type { GoogleBooksResponse, BookDetail } from '@/types/book'

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes'

export async function searchGoogleBooks(query: string): Promise<BookDetail | null> {
  try {
    const res = await fetch(`${BASE_URL}?q=intitle:${encodeURIComponent(query)}&maxResults=1`)
    if (!res.ok) return null

    const data: GoogleBooksResponse = await res.json()
    if (!data.items?.length) return null

    const vol = data.items[0].volumeInfo
    const thumbnail = vol.imageLinks?.medium
      ?? vol.imageLinks?.large
      ?? vol.imageLinks?.thumbnail
      ?? vol.imageLinks?.smallThumbnail

    return {
      id: '',
      title: vol.title,
      author: vol.authors?.join(', ') ?? '',
      description: vol.description,
      coverUrl: thumbnail?.replace('http://', 'https://'),
      publisher: vol.publisher,
      publishedDate: vol.publishedDate,
      pageCount: vol.pageCount,
      language: vol.language,
      categories: vol.categories,
      isbn: vol.industryIdentifiers?.find((i) => i.type === 'ISBN_13')?.identifier
        ?? vol.industryIdentifiers?.[0]?.identifier,
      status: 'finished',
    }
  } catch {
    return null
  }
}
