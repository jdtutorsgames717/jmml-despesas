import { useMemo, useState } from 'react'
import type { ItemDraft, ItemEstoque } from '../domain/estoque'
import type { useSyncedEstoque } from '../hooks/useSyncedEstoque'
import { isEstoqueBaixo, type Categoria } from '../domain/estoque'
import { Dashboard } from '../components/estoque/Dashboard'
import { Filtros } from '../components/estoque/Filtros'
import { ListaItens } from '../components/estoque/ListaItens'
import { FormularioItemDialog } from '../components/estoque/FormularioItemDialog'
import { ListaComprasDialog } from '../components/estoque/ListaComprasDialog'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useCasa } from '../hooks/useCasa'

type SyncStatus = ReturnType<typeof useSyncedEstoque>['syncStatus']

type Props = {
  casaId?: string
  itens: ItemEstoque[]
  actions: {
    adicionar: (draft: ItemDraft) => ItemEstoque
    atualizar: (id: string, patch: Partial<ItemDraft>) => void
    remover: (id: string) => void
    ajustarQuantidade: (id: string, delta: number) => void
  }
  syncStatus?: SyncStatus
  onSignOut?: () => void
}

function EmptyState({ onNovo }: { onNovo: () => void }) {
  return (
    <Card className="p-6">
      <div className="text-lg font-semibold">Nenhum item cadastrado</div>
      <div className="mt-1 text-sm text-slate-600">
        Cadastre seu primeiro produto para começar a controlar o estoque.
      </div>
      <div className="mt-4">
        <Button type="button" variant="primary" onClick={onNovo}>
          Cadastrar item
        </Button>
      </div>
    </Card>
  )
}

function StatusSync({ status }: { status?: SyncStatus }) {
  if (!status || status.state === 'idle') return null
  if (status.state === 'syncing') {
    return <span className="text-xs text-slate-500">Sincronizando…</span>
  }
  return (
    <span className="text-xs text-rose-700" title={status.message}>
      Falha ao sincronizar
    </span>
  )
}

export default function EstoquePage({
  casaId,
  itens,
  actions,
  syncStatus,
  onSignOut,
}: Props) {
  const { casa } = useCasa(casaId ?? null)

  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState<Categoria | 'Todas'>('Todas')
  const [apenasMonitorados, setApenasMonitorados] = useState(false)
  const [apenasEstoqueBaixo, setApenasEstoqueBaixo] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [itemEdicao, setItemEdicao] = useState<ItemEstoque | null>(null)
  const [listaComprasOpen, setListaComprasOpen] = useState(false)

  const stats = useMemo(() => {
    return {
      totalItens: itens.length,
      itensComEstoqueBaixo: itens.filter(isEstoqueBaixo).length,
      itensMonitorados: itens.filter((i) => i.monitorado).length,
    }
  }, [itens])

  const itensFiltrados = useMemo(() => {
    const b = busca.trim().toLocaleLowerCase('pt-BR')
    return itens.filter((i) => {
      if (apenasEstoqueBaixo && !isEstoqueBaixo(i)) return false
      if (apenasMonitorados && !i.monitorado) return false
      if (categoria !== 'Todas' && i.categoria !== categoria) return false
      if (b && !i.nome.toLocaleLowerCase('pt-BR').includes(b)) return false
      return true
    })
  }, [itens, busca, categoria, apenasMonitorados, apenasEstoqueBaixo])

  const abrirNovo = () => {
    setItemEdicao(null)
    setFormOpen(true)
  }

  const abrirEdicao = (item: ItemEstoque) => {
    setItemEdicao(item)
    setFormOpen(true)
  }

  const salvar = (draft: ItemDraft, id?: string) => {
    if (id) actions.atualizar(id, draft)
    else actions.adicionar(draft)
  }

  const remover = (item: ItemEstoque) => {
    const ok = window.confirm(`Remover "${item.nome}" do estoque?`)
    if (!ok) return
    actions.remover(item.id)
  }

  return (
    <div className="min-h-svh">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold leading-tight text-slate-900 sm:text-xl">
              Controle de Estoque Doméstico
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>Dados salvos automaticamente.</span>
              <StatusSync status={syncStatus} />
              {casa ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  Casa: <span className="font-semibold">{casa.nome}</span> • Código:{' '}
                  <span className="font-mono">{casa.codigo_convite}</span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            {onSignOut ? (
              <Button
                type="button"
                variant="secondary"
                className="flex-1 sm:flex-none"
                onClick={onSignOut}
              >
                🚪 Sair
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              className="flex-1 sm:flex-none"
              onClick={() => setListaComprasOpen(true)}
            >
              📋 Lista de compras
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-1 sm:flex-none"
              onClick={abrirNovo}
            >
              + Novo item
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-5">
        <Dashboard
          {...stats}
          onClickEstoqueBaixo={() => {
            setBusca('')
            setCategoria('Todas')
            setApenasMonitorados(false)
            setApenasEstoqueBaixo(true)
          }}
        />

        <Card className="p-4">
          <Filtros
            busca={busca}
            categoria={categoria}
            apenasMonitorados={apenasMonitorados}
            apenasEstoqueBaixo={apenasEstoqueBaixo}
            onChangeBusca={setBusca}
            onChangeCategoria={setCategoria}
            onChangeApenasMonitorados={setApenasMonitorados}
            onChangeApenasEstoqueBaixo={setApenasEstoqueBaixo}
          />
          {apenasEstoqueBaixo ? (
            <div className="mt-3 text-xs text-slate-600">
              Mostrando somente itens com <span className="font-semibold">estoque baixo</span> (quantidade
              atual &lt; 2).
            </div>
          ) : null}
        </Card>

        {itens.length === 0 ? (
          <EmptyState onNovo={abrirNovo} />
        ) : itensFiltrados.length === 0 ? (
          <Card className="p-6">
            <div className="text-lg font-semibold">Nada encontrado</div>
            <div className="mt-1 text-sm text-slate-600">
              Ajuste a busca ou os filtros para ver resultados.
            </div>
          </Card>
        ) : (
          <ListaItens
            itens={itensFiltrados}
            onEditar={abrirEdicao}
            onRemover={remover}
            onDeltaQuantidade={actions.ajustarQuantidade}
          />
        )}
      </main>

      <FormularioItemDialog
        open={formOpen}
        itemEdicao={itemEdicao}
        onClose={() => setFormOpen(false)}
        onSalvar={salvar}
      />

      <ListaComprasDialog
        open={listaComprasOpen}
        itens={itens}
        onClose={() => setListaComprasOpen(false)}
      />
    </div>
  )
}

