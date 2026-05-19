import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

export default function AuthPage() {
  const sb = supabase
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar')

  if (!sb) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <Card className="p-6">
          <div className="text-lg font-semibold">Supabase não configurado</div>
          <div className="mt-2 text-sm text-slate-600">
            Configure o arquivo <code>.env</code> usando o <code>.env.example</code>.
          </div>
        </Card>
      </div>
    )
  }

  const submit = async () => {
    setErro(null)
    setLoading(true)
    try {
      if (modo === 'entrar') {
        const { error } = await sb.auth.signInWithPassword({ email, password: senha })
        if (error) throw error
      } else {
        const { error } = await sb.auth.signUp({ email, password: senha })
        if (error) throw error
      }
    } catch (e: any) {
      setErro(e?.message ?? 'Falha ao autenticar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-lg items-center px-4 py-10">
      <Card className="w-full p-6">
        <h1 className="text-xl font-semibold">
          {modo === 'entrar' ? 'Entrar' : 'Criar conta'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Para sincronizar entre dispositivos, faça login.
        </p>

        <div className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">E-mail</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Senha</label>
            <Input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" />
          </div>

          {erro ? <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">{erro}</div> : null}

          <Button type="button" variant="primary" onClick={submit} disabled={loading || !email || !senha}>
            {loading ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </Button>

          <button
            type="button"
            className="text-sm text-indigo-700 hover:underline"
            onClick={() => setModo((m) => (m === 'entrar' ? 'criar' : 'entrar'))}
          >
            {modo === 'entrar'
              ? 'Não tem conta? Criar agora'
              : 'Já tem conta? Entrar'}
          </button>
        </div>
      </Card>
    </div>
  )
}
