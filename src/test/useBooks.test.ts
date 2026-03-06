import { describe, it, expect } from 'vitest'
import type { Book } from '@/types/book'

const sampleBooks: Book[] = [
  { id: '1', title: 'Book A', author: 'Author A', readDateStart: '2024-01-01', readDateEnd: '2024-02-01', status: 'finished', rating: 5 },
  { id: '2', title: 'Book B', titleEn: 'Book Beta', author: 'Author B', readDateStart: '2025-06-01', readDateEnd: '2025-07-15', status: 'finished', rating: 4 },
  { id: '3', title: 'Book C', author: 'Author C', readDateStart: '2025-01-01', status: 'reading' },
]

function filterBooks(books: Book[], year: string | null, search: string): Book[] {
  let filtered = books
  if (year && year !== 'all') {
    filtered = filtered.filter((b) => {
      const start = b.readDateStart?.substring(0, 4)
      const end = b.readDateEnd?.substring(0, 4)
      return start === year || end === year
    })
  }
  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.titleEn?.toLowerCase().includes(q)) ||
        b.author.toLowerCase().includes(q),
    )
  }
  return filtered
}

function getYears(books: Book[]): string[] {
  const years = new Set<string>()
  books.forEach((b) => {
    if (b.readDateStart) years.add(b.readDateStart.substring(0, 4))
  })
  return Array.from(years).sort().reverse()
}

describe('filterBooks', () => {
  it('returns all books when year=all and no search', () => {
    expect(filterBooks(sampleBooks, 'all', '')).toHaveLength(3)
  })

  it('filters by year', () => {
    const result = filterBooks(sampleBooks, '2025', '')
    expect(result).toHaveLength(2)
    expect(result.map((b) => b.id)).toContain('2')
    expect(result.map((b) => b.id)).toContain('3')
  })

  it('filters by search query (title)', () => {
    const result = filterBooks(sampleBooks, null, 'Book A')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('filters by search query (English title)', () => {
    const result = filterBooks(sampleBooks, null, 'Beta')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('filters by author', () => {
    const result = filterBooks(sampleBooks, null, 'Author C')
    expect(result).toHaveLength(1)
  })

  it('combines year and search', () => {
    const result = filterBooks(sampleBooks, '2025', 'Book B')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })
})

describe('getYears', () => {
  it('extracts unique years sorted descending', () => {
    const years = getYears(sampleBooks)
    expect(years).toEqual(['2025', '2024'])
  })

  it('returns empty for empty input', () => {
    expect(getYears([])).toEqual([])
  })
})
