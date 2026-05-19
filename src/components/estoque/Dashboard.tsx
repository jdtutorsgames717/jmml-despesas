import { Card } from '../ui/Card'

type Props = {
  totalItens: number
  itensComEstoqueBaixo: number
  itensMonitorados: number
  onClickEstoqueBaixo?: () => void
}

function Numero({ value }: { value: number }) {
  return <div className="text-3xl font-semibold tracking-tight">{value}</div>
}

export function Dashboard({
  totalItens,
  itensComEstoqueBaixo,
  itensMonitorados,
  onClickEstoqueBaixo,
}: Props) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card className="p-4">
        <div className="text-sm text-slate-600">Total de itens</div>
        <Numero value={totalItens} />
      </Card>

      <button
        type="button"
        className="text-left"
        onClick={onClickEstoqueBaixo}
        disabled={!onClickEstoqueBaixo}
        aria-label="Ver itens com estoque baixo"
      >
        <Card
          className={`p-4 transition ${
            onClickEstoqueBaixo
              ? 'cursor-pointer hover:border-indigo-300 hover:shadow-sm focus-within:ring-2 focus-within:ring-indigo-500'
              : ''
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-slate-600">Estoque baixo (&lt; 2)</div>
            {onClickEstoqueBaixo ? (
              <span className="text-xs font-medium text-indigo-700">Ver</span>
            ) : null}
          </div>
          <Numero value={itensComEstoqueBaixo} />
        </Card>
      </button>

      <Card className="p-4">
        <div className="text-sm text-slate-600">Monitorados</div>
        <Numero value={itensMonitorados} />
      </Card>
    </section>
  )
}
