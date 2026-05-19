import { useEffect, useMemo, useRef, useState } from 'react'
import type { ItemEstoque } from '../domain/estoque'
import { supabase } from '../lib/supabaseClient'
import { useEstoque } from './useEstoque'

type SyncStatus =
  | { state: 'idle' }
  | { state: 'syncing' }
  | { state: 'error'; message: string }

function mapFromDb(row: any): ItemEstoque {
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria,
    localArmazenamento: row.local_armazenamento,
    quantidadeAtual: row.quantidade_atual,
    quantidadeMinimaDesejada: row.quantidade_minima_desejada,
    validade: row.validade,
    observacao: row.observacao ?? '',
    monitorado: Boolean(row.monitorado),
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  }
}

function mapToDb(casaId: string, item: ItemEstoque) {
  return {
    id: item.id,
    casa_id: casaId,
    nome: item.nome,
    categoria: item.categoria,
    local_armazenamento: item.localArmazenamento,
    quantidade_atual: item.quantidadeAtual,
    quantidade_minima_desejada: item.quantidadeMinimaDesejada,
    validade: item.validade,
    observacao: item.observacao ?? '',
    monitorado: item.monitorado,
    criado_em: item.criadoEm,
    atualizado_em: item.atualizadoEm,
  }
}

export function useSyncedEstoque(casaId: string) {
  const sb = supabase
  const { itens, setItens, actions } = useEstoque(casaId)
  const [status, setStatus] = useState<SyncStatus>({ state: 'idle' })

  const loadedRef = useRef(false)
  const prevIdsRef = useRef<Set<string>>(new Set())
  const debounceRef = useRef<number | null>(null)

  // Carrega remoto e faz merge (última alteração vence)
  useEffect(() => {
    const load = async () => {
      console.log('[useSyncedEstoque] Carregando dados remotos', { sb: !!sb, casaId })
      if (!sb) {
        console.log('[useSyncedEstoque] Supabase não configurado')
        return
      }
      setStatus({ state: 'syncing' })
      try {
        console.log('[useSyncedEstoque] Fazendo select no Supabase')
        const { data, error } = await sb
          .from('estoque_itens')
          .select('*')
          .eq('casa_id', casaId)

        console.log('[useSyncedEstoque] Resultado do select:', { data, error })
        if (error) throw error
        const remotos = (data ?? []).map(mapFromDb)
        console.log('[useSyncedEstoque] Itens remotos mapeados:', remotos)

        // Merge por id + atualizadoEm
        const byId = new Map<string, ItemEstoque>()
        for (const i of itens) byId.set(i.id, i)
        for (const r of remotos) {
          const local = byId.get(r.id)
          if (!local) {
            byId.set(r.id, r)
            continue
          }
          const localTs = new Date(local.atualizadoEm).getTime()
          const remoteTs = new Date(r.atualizadoEm).getTime()
          byId.set(r.id, remoteTs > localTs ? r : local)
        }

        const merged = Array.from(byId.values())
        console.log('[useSyncedEstoque] Itens após merge:', merged)
        setItens(merged)
        prevIdsRef.current = new Set(merged.map((x) => x.id))
        loadedRef.current = true
        console.log('[useSyncedEstoque] loadedRef.current = true')
        setStatus({ state: 'idle' })
      } catch (e: any) {
        console.error('[useSyncedEstoque] Erro ao carregar:', e)
        setStatus({ state: 'error', message: e?.message ?? 'Falha ao sincronizar.' })
        loadedRef.current = true // evita travar; seguimos com localStorage
        console.log('[useSyncedEstoque] loadedRef.current = true (após erro)')
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [casaId, sb])

  // Envia mudanças para o Supabase (debounce)
  useEffect(() => {
    console.log('[useSyncedEstoque] useEffect sync - início', { 
      sb: !!sb, 
      loadedRef: loadedRef.current, 
      itensLength: itens.length,
      casaId 
    })
    
    if (!sb) {
      console.log('[useSyncedEstoque] Supabase não configurado, pulando sync')
      return
    }
    if (!loadedRef.current) {
      console.log('[useSyncedEstoque] loadedRef.current é false, pulando sync')
      return
    }

    const currentIds = new Set(itens.map((x) => x.id))
    const prevIds = prevIdsRef.current
    const deletedIds = [...prevIds].filter((id) => !currentIds.has(id))

    console.log('[useSyncedEstoque] Preparando sync', { 
      currentIds: Array.from(currentIds), 
      prevIds: Array.from(prevIds), 
      deletedIds 
    })

    // atualiza o "snapshot" de ids, para o próximo ciclo
    prevIdsRef.current = currentIds

    if (debounceRef.current) window.clearTimeout(debounceRef.current)

    debounceRef.current = window.setTimeout(async () => {
      console.log('[useSyncedEstoque] Iniciando sync após debounce')
      setStatus({ state: 'syncing' })
      try {
        if (itens.length > 0) {
          const rows = itens.map((i) => mapToDb(casaId, i))
          console.log('[useSyncedEstoque] Enviando upsert', { rows })
          
          const { error } = await sb
            .from('estoque_itens')
            .upsert(rows, { onConflict: 'id' })
          
          if (error) {
            console.error('[useSyncedEstoque] Erro no upsert:', error)
            throw error
          }
          console.log('[useSyncedEstoque] Upsert bem-sucedido')
        }

        if (deletedIds.length > 0) {
          console.log('[useSyncedEstoque] Deletando itens:', deletedIds)
          const { error } = await sb
            .from('estoque_itens')
            .delete()
            .eq('casa_id', casaId)
            .in('id', deletedIds)
          if (error) {
            console.error('[useSyncedEstoque] Erro no delete:', error)
            throw error
          }
          console.log('[useSyncedEstoque] Delete bem-sucedido')
        }

        setStatus({ state: 'idle' })
        console.log('[useSyncedEstoque] Sync completo')
      } catch (e: any) {
        console.error('[useSyncedEstoque] Erro durante sync:', e)
        setStatus({
          state: 'error',
          message:
            e?.message ??
            'Não foi possível sincronizar agora. Suas mudanças ficaram salvas localmente.',
        })
      }
    }, 800)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [itens, casaId, sb])

  const info = useMemo(() => status, [status])
  return { itens, actions, syncStatus: info }
}
