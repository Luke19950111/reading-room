import type { Book, BookDetail } from '@/types/book'
import { searchGoogleBooks } from './googleBooks'
import { searchOpenLibrary, getOpenLibraryCoverByISBN } from './openLibrary'

const CACHE_PREFIX = 'rr_book_'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000

interface CachedData {
  data: BookDetail
  timestamp: number
}

function getCached(key: string): BookDetail | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const cached: CachedData = JSON.parse(raw)
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return cached.data
  } catch {
    return null
  }
}

function setCache(key: string, data: BookDetail): void {
  try {
    const cached: CachedData = { data, timestamp: Date.now() }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cached))
  } catch {
    /* localStorage full — silently ignore */
  }
}

export async function enrichBookDetail(book: Book): Promise<BookDetail> {
  const cached = getCached(book.id)
  if (cached) {
    return { ...cached, ...book, coverUrl: book.coverUrl || cached.coverUrl }
  }

  const searchTerm = book.titleEn || book.title

  const googleResult = await searchGoogleBooks(searchTerm)
  if (googleResult) {
    const merged: BookDetail = {
      ...googleResult,
      ...book,
      coverUrl: book.coverUrl || googleResult.coverUrl,
      description: googleResult.description,
      publisher: googleResult.publisher,
      publishedDate: googleResult.publishedDate,
      pageCount: googleResult.pageCount,
      categories: googleResult.categories,
    }
    setCache(book.id, merged)
    return merged
  }

  const olResult = await searchOpenLibrary(searchTerm)
  if (olResult) {
    const merged: BookDetail = {
      ...olResult,
      ...book,
      coverUrl: book.coverUrl || olResult.coverUrl,
      description: olResult.description,
      publisher: olResult.publisher,
      publishedDate: olResult.publishedDate,
      pageCount: olResult.pageCount,
    }
    setCache(book.id, merged)
    return merged
  }

  if (book.isbn) {
    const detail: BookDetail = {
      ...book,
      coverUrl: book.coverUrl || getOpenLibraryCoverByISBN(book.isbn),
    }
    setCache(book.id, detail)
    return detail
  }

  return { ...book }
}

export async function fetchBookCover(book: Book): Promise<string | undefined> {
  if (book.coverUrl) return book.coverUrl

  const cached = getCached(book.id)
  if (cached?.coverUrl) return cached.coverUrl

  const searchTerm = book.titleEn || book.title

  const googleResult = await searchGoogleBooks(searchTerm)
  if (googleResult?.coverUrl) {
    setCache(book.id, { ...book, ...googleResult })
    return googleResult.coverUrl
  }

  const olResult = await searchOpenLibrary(searchTerm)
  if (olResult?.coverUrl) {
    setCache(book.id, { ...book, ...olResult })
    return olResult.coverUrl
  }

  if (book.isbn) {
    const url = getOpenLibraryCoverByISBN(book.isbn)
    setCache(book.id, { ...book, coverUrl: url })
    return url
  }

  return undefined
}

export async function fetchBooks(): Promise<Book[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/books.json`)
  if (!res.ok) throw new Error('Failed to load books data')
  return res.json()
}
