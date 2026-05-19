import { useMemo, useState } from 'react'
import { isEstoqueBaixo, type ItemEstoque } from '../../domain/estoque'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

type Props = {
  open: boolean
  itens: ItemEstoque[]
  onClose: () => void
}

function calcularSugestaoCompra(item: ItemEstoque) {
  // Regra simples:
  // - Sempre que estiver em "estoque baixo" (< 2), sugerimos comprar até atingir
  //   pelo menos o mínimo desejado (se configurado), ou 2 unidades (piso).
  const alvo = Math.max(2, item.quantidadeMinimaDesejada)
  const qtd = alvo - item.quantidadeAtual
  return Math.max(1, qtd)
}

export function ListaComprasDialog({ open, itens, onClose }: Props) {
  const [incluirAbaixoMinimo, setIncluirAbaixoMinimo] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const itensParaComprar = useMemo(() => {
    if (incluirAbaixoMinimo) {
      return itens.filter((i) => i.quantidadeAtual < i.quantidadeMinimaDesejada)
    }
    return itens.filter(isEstoqueBaixo)
  }, [itens, incluirAbaixoMinimo])

  const textoLista = useMemo(() => {
    if (itensParaComprar.length === 0) return ''
    return itensParaComprar
      .map((i) => {
        const sug = calcularSugestaoCompra(i)
        return `- ${i.nome} (${i.categoria}) — comprar ${sug} — local: ${i.localArmazenamento}`
      })
      .join('\n')
  }, [itensParaComprar])

  if (!open) return null

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoLista)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 1500)
    } catch {
      // Fallback: sem clipboard (permissão negada). Usuário ainda consegue copiar manualmente.
      setCopiado(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center print:relative print:inset-auto print:z-auto print:bg-transparent print:p-0">
      <Card className="w-full max-w-3xl p-4 print:max-w-none print:border-0 print:shadow-none">
        <div className="flex items-start justify-between gap-3 print:block">
          <div>
            <div className="text-lg font-semibold">📋 Lista de compras</div>
            <div className="mt-1 text-sm text-slate-600">
              Gerada automaticamente com base no seu estoque.
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={onClose} className="print:hidden">
            ✕ Fechar
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <label className="flex select-none items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={incluirAbaixoMinimo}
              onChange={(e) => setIncluirAbaixoMinimo(e.target.checked)}
            />
            Incluir itens abaixo do mínimo desejado
          </label>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={copiar}
              disabled={itensParaComprar.length === 0}
              title="Copia em formato de texto"
            >
              {copiado ? '✓ Copiado!' : '📋 Copiar'}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => window.print()}
              disabled={itensParaComprar.length === 0}
              title="Abre o diálogo de impressão do navegador"
            >
              🖨️ Imprimir
            </Button>
          </div>
        </div>

        <div className="mt-4">
          {itensParaComprar.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-700">
              Nenhum item para comprar agora.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Local</th>
                    <th className="px-4 py-3">Qtd. atual</th>
                    <th className="px-4 py-3">Sugestão comprar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {itensParaComprar.map((item) => {
                    const sugestao = calcularSugestaoCompra(item)
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {item.nome}
                        </td>
                        <td className="px-4 py-3">{item.categoria}</td>
                        <td className="px-4 py-3">{item.localArmazenamento}</td>
                        <td className="px-4 py-3 tabular-nums">{item.quantidadeAtual}</td>
                        <td className="px-4 py-3 tabular-nums">{sugestao}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Para copiar manualmente caso clipboard falhe */}
          {itensParaComprar.length > 0 ? (
            <div className="mt-3 print:hidden">
              <div className="mb-1 text-xs font-medium text-slate-700">
                Texto (para copiar/colar)
              </div>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
                {textoLista}
              </pre>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}

