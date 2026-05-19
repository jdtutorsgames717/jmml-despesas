import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import { useSession } from './hooks/useSession'
import AuthPage from './pages/AuthPage'
import CasaGate from './pages/CasaGate'
import EstoquePage from './pages/EstoquePage'
import { useEstoque } from './hooks/useEstoque'
import { useSyncedEstoque } from './hooks/useSyncedEstoque'
import { Card } from './components/ui/Card'

function Loading() {
  return (
    <div className="mx-auto flex min-h-svh max-w-lg items-center px-4 py-10">
      <Card className="w-full p-6">
        <div className="text-sm text-slate-600">Carregando…</div>
      </Card>
    </div>
  )
}

function LocalApp() {
  const { itens, actions } = useEstoque()
  return <EstoquePage itens={itens} actions={actions} />
}

function SyncedEstoquePage({ casaId }: { casaId: string }) {
  console.log('[SyncedEstoquePage] Renderizando com casaId:', casaId)
  
  const { itens, actions, syncStatus } = useSyncedEstoque(casaId)
  console.log('[SyncedEstoquePage] Hook executado com sucesso', { itens, syncStatus })
  
  return (
    <EstoquePage
      casaId={casaId}
      itens={itens}
      actions={actions}
      syncStatus={syncStatus}
      onSignOut={() => supabase?.auth.signOut()}
    />
  )
}

function SupabaseApp() {
  const { session, loading } = useSession()
  const [casaId, setCasaId] = useState<string | null>(null)

  console.log('[SupabaseApp] Estado:', { session: !!session, loading, casaId })

  useEffect(() => {
    if (!session) {
      console.log('[SupabaseApp] Sem sessão, limpando casaId')
      setCasaId(null)
    }
  }, [session])

  if (loading) {
    console.log('[SupabaseApp] Renderizando Loading')
    return <Loading />
  }
  if (!session) {
    console.log('[SupabaseApp] Renderizando AuthPage')
    return <AuthPage />
  }
  if (!casaId) {
    console.log('[SupabaseApp] Renderizando CasaGate')
    return <CasaGate session={session} onReady={(id) => {
      console.log('[SupabaseApp] onReady chamado com id:', id)
      setCasaId(id)
    }} />
  }
  
  console.log('[SupabaseApp] Renderizando SyncedEstoquePage com casaId:', casaId)
  return <SyncedEstoquePage casaId={casaId} />
}

export default function App() {
  return isSupabaseConfigured ? <SupabaseApp /> : <LocalApp />
}
