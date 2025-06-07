import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Basic Component Tests', () => {
  it('renders button component', () => {
    render(<Button>Test Button</Button>)
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('button can be clicked', () => {
    let clicked = false
    render(
      <Button onClick={() => { clicked = true }}>
        Click Me
      </Button>
    )
    
    const button = screen.getByText('Click Me')
    button.click()
    expect(clicked).toBe(true)
  })
}) 