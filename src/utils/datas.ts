const formatador = new Intl.DateTimeFormat('pt-BR')

export function formatarDataPtBr(yyyyMmDd: string) {
  // yyyy-mm-dd -> dd/mm/aaaa (pt-BR)
  const d = new Date(`${yyyyMmDd}T00:00:00`)
  return Number.isNaN(d.getTime()) ? yyyyMmDd : formatador.format(d)
}

export function diasAte(yyyyMmDd: string) {
  const alvo = new Date(`${yyyyMmDd}T00:00:00`)
  if (Number.isNaN(alvo.getTime())) return null

  const hoje = new Date()
  const hoje0 = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const alvo0 = new Date(alvo.getFullYear(), alvo.getMonth(), alvo.getDate())
  const diff = alvo0.getTime() - hoje0.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

