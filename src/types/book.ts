export interface Book {
  id: string
  title: string
  titleEn?: string
  author: string
  isbn?: string
  readDateStart?: string
  readDateEnd?: string
  status: 'reading' | 'finished' | 'wishlist'
  rating?: number
  coverUrl?: string
  review?: string
  tags?: string[]
}

export interface BookDetail extends Book {
  description?: string
  publisher?: string
  publishedDate?: string
  pageCount?: number
  language?: string
  categories?: string[]
}

export interface GoogleBooksVolume {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    pageCount?: number
    categories?: string[]
    imageLinks?: {
      smallThumbnail?: string
      thumbnail?: string
      small?: string
      medium?: string
      large?: string
    }
    language?: string
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
  }
}

export interface GoogleBooksResponse {
  totalItems: number
  items?: GoogleBooksVolume[]
}

export interface OpenLibrarySearchDoc {
  key: string
  title: string
  author_name?: string[]
  cover_i?: number
  isbn?: string[]
  publisher?: string[]
  first_publish_year?: number
  number_of_pages_median?: number
}

export interface OpenLibrarySearchResponse {
  numFound: number
  docs: OpenLibrarySearchDoc[]
}
