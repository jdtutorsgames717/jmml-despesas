import { useEffect, useMemo, useState } from 'react'

type Setter<T> = (value: T | ((prev: T) => T)) => void

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
): [T, Setter<T>] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return initialValue
      return JSON.parse(raw) as T
    } catch {
      return initialValue
    }
  })

  const stableInitial = useMemo(() => initialValue, [])

  useEffect(() => {
    // Caso o schema mude e o parse falhe, o estado vira initialValue e seguimos.
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // Sem ação: em caso de quota cheia, o app continua funcionando em memória.
    }
  }, [key, state])

  useEffect(() => {
    // Mantém state coerente caso alguém limpe o storage manualmente.
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== key) return
      try {
        const raw = localStorage.getItem(key)
        setState(raw ? (JSON.parse(raw) as T) : stableInitial)
      } catch {
        setState(stableInitial)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key, stableInitial])

  return [state, setState]
}

