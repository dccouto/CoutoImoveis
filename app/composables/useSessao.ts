import { traduzirErro } from '~/utils/traduzirErro'

export function useSessao() {
  const { cliente, configurado } = useClienteSupabase()
  const usuarioEmail = useState<string | null>('usuario-email', () => null)
  const sessaoPronta = useState('sessao-pronta', () => false)

  async function carregarSessao() {
    if (!cliente) {
      usuarioEmail.value = null
      sessaoPronta.value = true
      return null
    }
    const { data: resposta } = await cliente.auth.getSession()
    usuarioEmail.value = resposta.session?.user.email ?? null
    sessaoPronta.value = true
    return resposta.session
  }

  async function entrar(email: string, senha: string) {
    if (!cliente) {
      throw new Error('Configure o Supabase antes de entrar.')
    }
    const { data: resposta, error: erro } = await cliente.auth.signInWithPassword({
      email,
      password: senha,
    })
    if (erro) throw new Error(traduzirErro(erro))
    usuarioEmail.value = resposta.user?.email ?? email
    sessaoPronta.value = true
    return resposta
  }

  async function sair() {
    if (cliente) await cliente.auth.signOut()
    usuarioEmail.value = null
    await navigateTo('/admin/login')
  }

  return { usuarioEmail, sessaoPronta, configurado, carregarSessao, entrar, sair }
}
