import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isEstoqueBaixo, type ItemEstoque } from '../domain/estoque'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useSyncedEstoque } from '../hooks/useSyncedEstoque'

function calcularSugestaoCompra(item: ItemEstoque) {
  const alvo = Math.max(2, item.quantidadeMinimaDesejada)
  const qtd = alvo - item.quantidadeAtual
  return Math.max(1, qtd)
}

export default function ListaComprasPage() {
  const [searchParams] = useSearchParams()
  const casaId = searchParams.get('casaId') || ''
  const { itens } = useSyncedEstoque(casaId)
  
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

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoLista)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 1500)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl">
        <Card className="p-6 print:border-0 print:shadow-none">
          <div className="flex items-start justify-between gap-3 print:block">
            <div>
              <h1 className="text-2xl font-bold">📋 Lista de Compras</h1>
              <p className="mt-1 text-sm text-slate-600">
                Gerada automaticamente com base no seu estoque.
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button
                type="button"
                variant="primary"
                onClick={copiar}
                disabled={itensParaComprar.length === 0}
              >
                {copiado ? '✓ Copiado!' : '📋 Copiar'}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => window.print()}
                disabled={itensParaComprar.length === 0}
              >
                🖨️ Imprimir
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => window.close()}
              >
                ✕ Fechar
              </Button>
            </div>
          </div>

          <div className="mt-6 print:hidden">
            <label className="flex select-none items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={incluirAbaixoMinimo}
                onChange={(e) => setIncluirAbaixoMinimo(e.target.checked)}
              />
              Incluir itens abaixo do mínimo desejado
            </label>
          </div>

          <div className="mt-6">
            {itensParaComprar.length === 0 ? (
              <div className="rounded-md border border-slate-200 bg-white p-6 text-center text-slate-700">
                <p className="text-lg font-medium">Nenhum item para comprar agora</p>
                <p className="mt-1 text-sm text-slate-600">
                  Seu estoque está em dia! 🎉
                </p>
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

            {itensParaComprar.length > 0 ? (
              <div className="mt-6 print:hidden">
                <div className="mb-2 text-xs font-medium text-slate-700">
                  Texto (para copiar/colar)
                </div>
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800">
                  {textoLista}
                </pre>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
