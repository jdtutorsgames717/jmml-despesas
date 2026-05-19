import { useMemo } from 'react'
import {
  type Id,
  type ItemDraft,
  type ItemEstoque,
  storageKeyItens,
} from '../domain/estoque'
import { gerarId } from '../utils/id'
import { useLocalStorageState } from './useLocalStorageState'

export function useEstoque(casaId?: string) {
  const [itens, setItens] = useLocalStorageState<ItemEstoque[]>(
    storageKeyItens(casaId),
    [],
  )

  const itensOrdenados = useMemo(() => {
    return [...itens].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [itens])

  const actions = useMemo(() => {
    return {
      adicionar(draft: ItemDraft) {
        const agora = new Date().toISOString()
        const novo: ItemEstoque = {
          ...draft,
          id: gerarId(),
          criadoEm: agora,
          atualizadoEm: agora,
        }
        setItens((prev) => [...prev, novo])
        return novo
      },

      atualizar(id: Id, patch: Partial<ItemDraft>) {
        const agora = new Date().toISOString()
        setItens((prev) =>
          prev.map((i) => (i.id === id ? { ...i, ...patch, atualizadoEm: agora } : i)),
        )
      },

      remover(id: Id) {
        setItens((prev) => prev.filter((i) => i.id !== id))
      },

      ajustarQuantidade(id: Id, delta: number) {
        const agora = new Date().toISOString()
        setItens((prev) =>
          prev.map((i) => {
            if (i.id !== id) return i
            const novaQtd = Math.max(0, i.quantidadeAtual + delta)
            return { ...i, quantidadeAtual: novaQtd, atualizadoEm: agora }
          }),
        )
      },
    }
  }, [setItens])

  return { itens: itensOrdenados, setItens, actions }
}
