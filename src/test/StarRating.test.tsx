import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StarRating from '@/components/StarRating'

describe('StarRating', () => {
  it('renders correct number of stars', () => {
    render(<StarRating rating={3} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('aria-label', '3/5')
    const svgs = img.querySelectorAll('svg')
    expect(svgs).toHaveLength(5)
  })

  it('renders with custom max', () => {
    render(<StarRating rating={2} max={3} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('aria-label', '2/3')
    const svgs = img.querySelectorAll('svg')
    expect(svgs).toHaveLength(3)
  })

  it('applies filled color to rated stars', () => {
    const { container } = render(<StarRating rating={4} />)
    const svgs = container.querySelectorAll('svg')
    const filled = Array.from(svgs).filter((s) => s.classList.contains('text-accent-400'))
    expect(filled).toHaveLength(4)
  })
})
