import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { STORAGE_KEY_CASA_ATUAL } from '../domain/estoque'
import { supabase } from '../lib/supabaseClient'

type Casa = {
  id: string
  nome: string
  codigo_convite: string
}

function gerarCodigoConvite() {
  // 6 caracteres (A-Z0-9) para facilitar digitação
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export default function CasaGate({
  session,
  onReady,
}: {
  session: Session
  onReady: (casaId: string) => void
}) {
  const sb = supabase
  const [casas, setCasas] = useState<Casa[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [casaNome, setCasaNome] = useState('')
  const [codigoConvite, setCodigoConvite] = useState('')

  const casaAtualStorage = useMemo(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_CASA_ATUAL)
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!sb) return
      setLoading(true)
      setErro(null)
      try {
        const { data, error } = await sb
          .from('casa_membros')
          .select('casa_id, cas ( id, nome, codigo_convite )')
          .eq('user_id', session.user.id)

        if (error) throw error
        const list: Casa[] =
          data?.map((row: any) => row.cas).filter(Boolean) ?? []
        setCasas(list)

        const preferida =
          (casaAtualStorage && list.find((c) => c.id === casaAtualStorage)?.id) ||
          list[0]?.id
        if (preferida) onReady(preferida)
      } catch (e: any) {
        setErro(e?.message ?? 'Falha ao carregar suas casas.')
      } finally {
        setLoading(false)
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.user.id])

  const selecionar = (id: string) => {
    console.log('[selecionar] Selecionando casa:', id)
    try {
      localStorage.setItem(STORAGE_KEY_CASA_ATUAL, id)
      console.log('[selecionar] Salvo no localStorage')
    } catch (e) {
      console.error('[selecionar] Erro ao salvar no localStorage:', e)
    }
    console.log('[selecionar] Chamando onReady com id:', id)
    onReady(id)
  }

  const criarCasa = async () => {
    if (!sb) return
    setErro(null)
    setLoading(true)
    try {
      const codigo = gerarCodigoConvite()
      console.log('[criarCasa] Criando casa com código:', codigo)
      
      const { data: casa, error: errCasa } = await sb
        .from('cas')
        .insert({ nome: casaNome.trim(), codigo_convite: codigo })
        .select('id')
        .single()
      
      console.log('[criarCasa] Resultado da criação:', { casa, errCasa })
      if (errCasa) throw errCasa

      console.log('[criarCasa] Entrando na casa com código:', codigo)
      const { data: casaIdRetornado, error: errJoin } = await sb.rpc('entrar_na_casa', {
        _codigo_convite: codigo,
      })
      
      console.log('[criarCasa] Resultado de entrar_na_casa:', { casaIdRetornado, errJoin })
      if (errJoin) throw errJoin

      console.log('[criarCasa] Selecionando casa:', casa.id)
      selecionar(casa.id)
    } catch (e: any) {
      console.error('[criarCasa] Erro:', e)
      setErro(e?.message ?? 'Falha ao criar casa.')
    } finally {
      setLoading(false)
    }
  }

  const entrarComCodigo = async () => {
    if (!sb) return
    setErro(null)
    setLoading(true)
    try {
      const code = codigoConvite.trim().toUpperCase()
      const { data, error } = await sb.rpc('entrar_na_casa', {
        _codigo_convite: code,
      })
      if (error) throw error

      // A função retorna o id da casa
      selecionar(data as string)
    } catch (e: any) {
      setErro(e?.message ?? 'Falha ao entrar na casa.')
    } finally {
      setLoading(false)
    }
  }

  if (!sb) return null

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl items-center px-4 py-10">
      <div className="w-full space-y-4">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xl font-semibold">Escolha uma casa</div>
              <div className="mt-1 text-sm text-slate-600">
                O estoque será compartilhado entre as pessoas da mesma casa.
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => sb.auth.signOut()}
            >
              Sair
            </Button>
          </div>

          {erro ? (
            <div className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
              {erro}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-4 text-sm text-slate-600">Carregando…</div>
          ) : casas.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {casas.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="text-left"
                  onClick={() => selecionar(c.id)}
                >
                  <Card className="p-4 transition hover:border-indigo-300 hover:shadow-sm">
                    <div className="text-base font-semibold">{c.nome}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Código: <span className="font-mono">{c.codigo_convite}</span>
                    </div>
                    <div className="mt-3 text-xs text-indigo-700">Entrar</div>
                  </Card>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-600">
              Você ainda não participa de nenhuma casa.
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-6">
            <div className="text-lg font-semibold">Criar casa</div>
            <div className="mt-1 text-sm text-slate-600">
              Crie um novo grupo e compartilhe o código com outras pessoas.
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Nome da casa
              </label>
              <Input value={casaNome} onChange={(e) => setCasaNome(e.target.value)} placeholder="Ex.: Casa da Maria" />
            </div>
            <div className="mt-4">
              <Button
                type="button"
                variant="primary"
                onClick={criarCasa}
                disabled={loading || casaNome.trim().length < 2}
              >
                Criar
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-lg font-semibold">Entrar com código</div>
            <div className="mt-1 text-sm text-slate-600">
              Informe o código de convite de uma casa existente.
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Código
              </label>
              <Input
                value={codigoConvite}
                onChange={(e) => setCodigoConvite(e.target.value)}
                placeholder="Ex.: 6D8KQZ"
              />
            </div>
            <div className="mt-4">
              <Button
                type="button"
                variant="primary"
                onClick={entrarComCodigo}
                disabled={loading || codigoConvite.trim().length < 4}
              >
                Entrar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
