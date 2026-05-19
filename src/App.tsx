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

function SupabaseApp() {
  const { session, loading } = useSession()
  const [casaId, setCasaId] = useState<string | null>(null)

  useEffect(() => {
    if (!session) setCasaId(null)
  }, [session])

  if (loading) return <Loading />
  if (!session) return <AuthPage />
  if (!casaId) return <CasaGate session={session} onReady={setCasaId} />

  const { itens, actions, syncStatus } = useSyncedEstoque(casaId)

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

export default function App() {
  return isSupabaseConfigured ? <SupabaseApp /> : <LocalApp />
}
