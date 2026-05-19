import {
  isAbaixoDoMinimoDesejado,
  isEstoqueBaixo,
  type ItemEstoque,
} from '../../domain/estoque'
import { diasAte, formatarDataPtBr } from '../../utils/datas'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

type Props = {
  itens: ItemEstoque[]
  onEditar: (item: ItemEstoque) => void
  onRemover: (item: ItemEstoque) => void
  onDeltaQuantidade: (id: string, delta: number) => void
}

function Badge({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode
  tone?: 'slate' | 'amber' | 'rose' | 'emerald'
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-800',
    emerald: 'bg-emerald-100 text-emerald-800',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${tones[tone]}`}>
      {children}
    </span>
  )
}

function StatusValidade({ validade }: { validade: string }) {
  const d = diasAte(validade)
  if (d === null) return null
  if (d < 0) return <Badge tone="rose">Vencido</Badge>
  if (d === 0) return <Badge tone="rose">Vence hoje</Badge>
  if (d <= 7) return <Badge tone="amber">Vence em {d} dia(s)</Badge>
  return <Badge tone="emerald">Ok</Badge>
}

function AcoesQuantidade({
  id,
  qtd,
  onDelta,
}: {
  id: string
  qtd: number
  onDelta: (id: string, delta: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => onDelta(id, -1)}
        aria-label="Diminuir quantidade"
      >
        −
      </Button>
      <span className="w-10 text-center tabular-nums">{qtd}</span>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => onDelta(id, +1)}
        aria-label="Aumentar quantidade"
      >
        +
      </Button>
    </div>
  )
}

export function ListaItens({ itens, onEditar, onRemover, onDeltaQuantidade }: Props) {
  return (
    <section className="space-y-3">
      {/* Tabela (desktop) */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Local</th>
              <th className="px-4 py-3">Qtd. atual</th>
              <th className="px-4 py-3">Mín. desejado</th>
              <th className="px-4 py-3">Validade</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {itens.map((item) => {
              const baixo = isEstoqueBaixo(item)
              const abaixoMinimo = isAbaixoDoMinimoDesejado(item)
              return (
                <tr key={item.id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{item.nome}</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {item.monitorado ? (
                        <Badge tone="slate">Monitorado</Badge>
                      ) : (
                        <Badge tone="slate">Não monitorado</Badge>
                      )}
                      {baixo && <Badge tone="rose">Estoque baixo</Badge>}
                      {!baixo && abaixoMinimo && (
                        <Badge tone="amber">Abaixo do mínimo</Badge>
                      )}
                    </div>
                    {item.observacao ? (
                      <div className="mt-2 text-xs text-slate-600">
                        {item.observacao}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{item.categoria}</td>
                  <td className="px-4 py-3">{item.localArmazenamento}</td>
                  <td className="px-4 py-3">
                    <AcoesQuantidade
                      id={item.id}
                      qtd={item.quantidadeAtual}
                      onDelta={onDeltaQuantidade}
                    />
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {item.quantidadeMinimaDesejada}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums">{formatarDataPtBr(item.validade)}</span>
                      <StatusValidade validade={item.validade} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="ghost" onClick={() => onEditar(item)}>
                        Editar
                      </Button>
                      <Button type="button" size="sm" variant="danger" onClick={() => onRemover(item)}>
                        Remover
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {itens.map((item) => {
          const baixo = isEstoqueBaixo(item)
          const abaixoMinimo = isAbaixoDoMinimoDesejado(item)
          return (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold">{item.nome}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {item.categoria} • {item.localArmazenamento}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusValidade validade={item.validade} />
                  {item.monitorado ? (
                    <Badge tone="slate">Monitorado</Badge>
                  ) : (
                    <Badge tone="slate">Não monitorado</Badge>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {baixo && <Badge tone="rose">Estoque baixo</Badge>}
                {!baixo && abaixoMinimo && <Badge tone="amber">Abaixo do mínimo</Badge>}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-600">Qtd. atual</div>
                  <AcoesQuantidade
                    id={item.id}
                    qtd={item.quantidadeAtual}
                    onDelta={onDeltaQuantidade}
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-600">Mín. desejado</div>
                  <div className="mt-2 tabular-nums">{item.quantidadeMinimaDesejada}</div>
                </div>
              </div>

              <div className="mt-3 text-sm">
                <span className="text-slate-600">Validade:</span>{' '}
                <span className="tabular-nums">{formatarDataPtBr(item.validade)}</span>
              </div>

              {item.observacao ? (
                <div className="mt-3 text-sm text-slate-700">{item.observacao}</div>
              ) : null}

              <div className="mt-4 flex gap-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => onEditar(item)}>
                  Editar
                </Button>
                <Button type="button" variant="danger" className="flex-1" onClick={() => onRemover(item)}>
                  Remover
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

