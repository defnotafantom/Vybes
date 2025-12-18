import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated', delay: 500 })
    
    // Value should still be initial before timeout
    expect(result.current).toBe('initial')

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Now it should be updated
    expect(result.current).toBe('updated')
  })

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Rapid changes
    rerender({ value: 'change1', delay: 500 })
    act(() => {
      jest.advanceTimersByTime(200)
    })
    
    rerender({ value: 'change2', delay: 500 })
    act(() => {
      jest.advanceTimersByTime(200)
    })
    
    rerender({ value: 'final', delay: 500 })
    
    // Still initial because timer keeps resetting
    expect(result.current).toBe('initial')

    // Complete the final timer
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Should have the final value
    expect(result.current).toBe('final')
  })

  it('works with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    )

    rerender({ value: 'updated', delay: 1000 })
    
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current).toBe('initial')

    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current).toBe('updated')
  })

  it('works with object values', () => {
    const initialObj = { name: 'test' }
    const updatedObj = { name: 'updated' }
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 500 } }
    )

    expect(result.current).toBe(initialObj)

    rerender({ value: updatedObj, delay: 500 })
    
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe(updatedObj)
  })
})


