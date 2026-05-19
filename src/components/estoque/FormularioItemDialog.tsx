import { useEffect, useMemo, useState } from 'react'
import { CATEGORIAS_PADRAO, type Categoria, type ItemDraft, type ItemEstoque } from '../../domain/estoque'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

type Props = {
  open: boolean
  itemEdicao: ItemEstoque | null
  onClose: () => void
  onSalvar: (draft: ItemDraft, id?: string) => void
}

type Erros = Partial<Record<keyof ItemDraft, string>>

function toInt(value: string) {
  const n = Number.parseInt(value, 10)
  return Number.isNaN(n) ? 0 : n
}

export function FormularioItemDialog({ open, itemEdicao, onClose, onSalvar }: Props) {
  const modo = itemEdicao ? 'editar' : 'novo'

  const initial: ItemDraft = useMemo(
    () => ({
      nome: itemEdicao?.nome ?? '',
      categoria: itemEdicao?.categoria ?? 'Alimentos',
      localArmazenamento: itemEdicao?.localArmazenamento ?? '',
      quantidadeAtual: itemEdicao?.quantidadeAtual ?? 0,
      quantidadeMinimaDesejada: itemEdicao?.quantidadeMinimaDesejada ?? 0,
      validade: itemEdicao?.validade ?? '',
      observacao: itemEdicao?.observacao ?? '',
      monitorado: itemEdicao?.monitorado ?? true,
    }),
    [itemEdicao],
  )

  const [form, setForm] = useState<ItemDraft>(initial)
  const [erros, setErros] = useState<Erros>({})

  useEffect(() => {
    if (!open) return
    setForm(initial)
    setErros({})
  }, [open, initial])

  if (!open) return null

  const validar = () => {
    const next: Erros = {}
    if (!form.nome.trim()) next.nome = 'Informe o nome do produto.'
    if (!form.localArmazenamento.trim())
      next.localArmazenamento = 'Informe o local de armazenamento.'
    if (!form.validade) next.validade = 'Informe a data de validade.'
    if (form.quantidadeAtual < 0) next.quantidadeAtual = 'A quantidade não pode ser negativa.'
    if (form.quantidadeMinimaDesejada < 0)
      next.quantidadeMinimaDesejada = 'O mínimo não pode ser negativo.'
    setErros(next)
    return Object.keys(next).length === 0
  }

  const submit = () => {
    if (!validar()) return
    onSalvar(form, itemEdicao?.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
      <Card className="w-full max-w-2xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">
              {modo === 'novo' ? 'Novo item' : 'Editar item'}
            </div>
            <div className="text-sm text-slate-600">
              Preencha os dados abaixo. A validade é obrigatória.
            </div>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Nome do produto
            </label>
            <Input
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              placeholder="Ex.: Arroz, Sabão em pó..."
            />
            {erros.nome ? <p className="mt-1 text-xs text-rose-600">{erros.nome}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Categoria
            </label>
            <Select
              value={form.categoria}
              onChange={(e) =>
                setForm((p) => ({ ...p, categoria: e.target.value as Categoria }))
              }
            >
              {CATEGORIAS_PADRAO.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Local de armazenamento
            </label>
            <Input
              value={form.localArmazenamento}
              onChange={(e) =>
                setForm((p) => ({ ...p, localArmazenamento: e.target.value }))
              }
              placeholder="Ex.: Despensa, Armário, Geladeira..."
            />
            {erros.localArmazenamento ? (
              <p className="mt-1 text-xs text-rose-600">{erros.localArmazenamento}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Quantidade atual
            </label>
            <Input
              inputMode="numeric"
              value={String(form.quantidadeAtual)}
              onChange={(e) => setForm((p) => ({ ...p, quantidadeAtual: toInt(e.target.value) }))}
            />
            {erros.quantidadeAtual ? (
              <p className="mt-1 text-xs text-rose-600">{erros.quantidadeAtual}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Quantidade mínima desejada
            </label>
            <Input
              inputMode="numeric"
              value={String(form.quantidadeMinimaDesejada)}
              onChange={(e) =>
                setForm((p) => ({ ...p, quantidadeMinimaDesejada: toInt(e.target.value) }))
              }
            />
            {erros.quantidadeMinimaDesejada ? (
              <p className="mt-1 text-xs text-rose-600">{erros.quantidadeMinimaDesejada}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Data de validade
            </label>
            <Input
              type="date"
              value={form.validade}
              onChange={(e) => setForm((p) => ({ ...p, validade: e.target.value }))}
            />
            {erros.validade ? (
              <p className="mt-1 text-xs text-rose-600">{erros.validade}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Observação
            </label>
            <Input
              value={form.observacao}
              onChange={(e) => setForm((p) => ({ ...p, observacao: e.target.value }))}
              placeholder="Ex.: Sem lactose, comprar na promoção..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex select-none items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={form.monitorado}
                onChange={(e) => setForm((p) => ({ ...p, monitorado: e.target.checked }))}
              />
              Monitorar este item (aparece no contador do Dashboard)
            </label>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={submit}>
            Salvar
          </Button>
        </div>
      </Card>
    </div>
  )
}

