import { CATEGORIAS_PADRAO, type Categoria } from '../../domain/estoque'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

type Props = {
  busca: string
  categoria: Categoria | 'Todas'
  apenasMonitorados: boolean
  apenasEstoqueBaixo: boolean
  onChangeBusca: (value: string) => void
  onChangeCategoria: (value: Categoria | 'Todas') => void
  onChangeApenasMonitorados: (value: boolean) => void
  onChangeApenasEstoqueBaixo: (value: boolean) => void
}

export function Filtros({
  busca,
  categoria,
  apenasMonitorados,
  apenasEstoqueBaixo,
  onChangeBusca,
  onChangeCategoria,
  onChangeApenasMonitorados,
  onChangeApenasEstoqueBaixo,
}: Props) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-12">
      <div className="md:col-span-6">
        <label className="mb-1 block text-xs font-medium text-slate-700">
          Buscar por nome
        </label>
        <Input
          value={busca}
          onChange={(e) => onChangeBusca(e.target.value)}
          placeholder="Ex.: Arroz, Detergente..."
        />
      </div>

      <div className="md:col-span-3">
        <label className="mb-1 block text-xs font-medium text-slate-700">
          Categoria
        </label>
        <Select
          value={categoria}
          onChange={(e) => onChangeCategoria(e.target.value as Categoria | 'Todas')}
        >
          <option value="Todas">Todas</option>
          {CATEGORIAS_PADRAO.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div className="md:col-span-3">
        <div className="mb-1 block text-xs font-medium text-slate-700">Opções</div>
        <div className="flex flex-col gap-2">
          <label className="flex h-10 select-none items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm">
            <input
              type="checkbox"
              checked={apenasMonitorados}
              onChange={(e) => onChangeApenasMonitorados(e.target.checked)}
            />
            Apenas monitorados
          </label>
          <label className="flex h-10 select-none items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm">
            <input
              type="checkbox"
              checked={apenasEstoqueBaixo}
              onChange={(e) => onChangeApenasEstoqueBaixo(e.target.checked)}
            />
            Somente estoque baixo
          </label>
        </div>
      </div>
    </section>
  )
}
