import type { SupabaseClient } from '@supabase/supabase-js'

export default defineNuxtRouteMiddleware(async (para) => {
  const caminho = para.path
  if (!caminho.startsWith('/admin') || caminho === '/admin/login') return
  const cliente = useNuxtApp().$supabase as SupabaseClient | null
  if (!cliente) return navigateTo('/admin/login')
  const { data: resposta } = await cliente.auth.getSession()
  if (!resposta.session) return navigateTo('/admin/login')
  setPageLayout('painel')
})
