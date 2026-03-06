import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Skeleton, { BookCardSkeleton } from '@/components/Skeleton'

describe('Skeleton', () => {
  it('renders with custom className', () => {
    const { container } = render(<Skeleton className="h-20 w-40" />)
    const el = container.firstChild as HTMLElement
    expect(el.classList.contains('animate-pulse')).toBe(true)
    expect(el.classList.contains('h-20')).toBe(true)
    expect(el).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('BookCardSkeleton', () => {
  it('renders skeleton structure', () => {
    const { container } = render(<BookCardSkeleton />)
    const skeletons = container.querySelectorAll('[aria-hidden="true"]')
    expect(skeletons.length).toBeGreaterThanOrEqual(2)
  })
})
