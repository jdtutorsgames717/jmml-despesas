export const CATEGORIAS_PADRAO = [
  'Alimentos',
  'Limpeza',
  'Higiene',
  'Congelados',
  'Outros',
] as const

export type Categoria = (typeof CATEGORIAS_PADRAO)[number]

export const ESTOQUE_BAIXO_LIMIAR = 2

export type Id = string

export interface ItemEstoque {
  id: Id
  nome: string
  categoria: Categoria
  localArmazenamento: string
  quantidadeAtual: number
  quantidadeMinimaDesejada: number
  validade: string // yyyy-mm-dd (obrigatório)
  observacao: string
  monitorado: boolean
  criadoEm: string // ISO
  atualizadoEm: string // ISO
}

export interface ItemDraft {
  nome: string
  categoria: Categoria
  localArmazenamento: string
  quantidadeAtual: number
  quantidadeMinimaDesejada: number
  validade: string
  observacao: string
  monitorado: boolean
}

export const STORAGE_KEY_ITENS = 'jmml_estoque_itens_v1'
export const STORAGE_KEY_CASA_ATUAL = 'jmml_casa_atual_v1'

export function storageKeyItens(casaId?: string) {
  return casaId ? `${STORAGE_KEY_ITENS}:${casaId}` : STORAGE_KEY_ITENS
}

export function isEstoqueBaixo(item: Pick<ItemEstoque, 'quantidadeAtual'>) {
  return item.quantidadeAtual < ESTOQUE_BAIXO_LIMIAR
}

export function isAbaixoDoMinimoDesejado(
  item: Pick<ItemEstoque, 'quantidadeAtual' | 'quantidadeMinimaDesejada'>,
) {
  return item.quantidadeAtual < item.quantidadeMinimaDesejada
}
