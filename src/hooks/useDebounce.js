import { useEffect, useMemo, useRef } from 'react'

export function useDebounce(fn, wait, maxWait) {
  const funcRef = useRef(fn)
  funcRef.current = fn

  const timeoutRef = useRef(null)
  const maxTimeoutRef = useRef(null)
  const lastArgsRef = useRef(null)

  const cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current)
      maxTimeoutRef.current = null
    }
  }

  const debounced = useMemo(() => {
    const wrapped = (...args) => {
      lastArgsRef.current = args

      if (timeoutRef.current)
        clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(() => {
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current)
          maxTimeoutRef.current = null
        }
        funcRef.current?.(...lastArgsRef.current)
        timeoutRef.current = null
      }, wait)

      if (maxWait && !maxTimeoutRef.current) {
        maxTimeoutRef.current = setTimeout(() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
          funcRef.current?.(...lastArgsRef.current)
          maxTimeoutRef.current = null
        }, maxWait)
      }
    }

    wrapped.cancel = cancel
    return wrapped
  }, [wait, maxWait])

  // 清理定时器（组件卸载时）
  useEffect(() => cancel, [])

  return debounced
}
