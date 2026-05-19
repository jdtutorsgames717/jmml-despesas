import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export type CasaInfo = {
  id: string
  nome: string
  codigo_convite: string
}

export function useCasa(casaId: string | null) {
  const [casa, setCasa] = useState<CasaInfo | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!supabase || !casaId) {
        setCasa(null)
        return
      }
      const { data, error } = await supabase
        .from('cas')
        .select('id, nome, codigo_convite')
        .eq('id', casaId)
        .single()
      if (error) {
        setCasa(null)
        return
      }
      setCasa(data as CasaInfo)
    }
    load()
  }, [casaId])

  return { casa }
}

