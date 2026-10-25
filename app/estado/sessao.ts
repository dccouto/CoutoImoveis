import { reactive } from 'vue'
import type { SupabaseClient } from '@supabase/supabase-js'
import { traduzirErro } from '~/utils/traduzirErro'

export const estadoSessao = reactive({
  usuarioEmail: null as string | null,
  sessaoPronta: false,
})

export async function carregarSessao(cliente: SupabaseClient | null) {
  if (!cliente) {
    estadoSessao.usuarioEmail = null
    estadoSessao.sessaoPronta = true
    return null
  }
  const { data: resposta } = await cliente.auth.getSession()
  estadoSessao.usuarioEmail = resposta.session?.user.email ?? null
  estadoSessao.sessaoPronta = true
  return resposta.session
}

export async function entrar(cliente: SupabaseClient | null, email: string, senha: string) {
  if (!cliente) {
    throw new Error('Configure o Supabase antes de entrar.')
  }
  const { data: resposta, error: erro } = await cliente.auth.signInWithPassword({
    email,
    password: senha,
  })
  if (erro) throw new Error(traduzirErro(erro))
  estadoSessao.usuarioEmail = resposta.user?.email ?? email
  estadoSessao.sessaoPronta = true
  return resposta
}

export async function sair(cliente: SupabaseClient | null) {
  if (cliente) await cliente.auth.signOut()
  estadoSessao.usuarioEmail = null
}
