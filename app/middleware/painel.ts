export default defineNuxtRouteMiddleware(async () => {
  const { cliente, configurado } = useClienteSupabase()
  if (!configurado.value || !cliente) return navigateTo('/admin/login')
  const { data: resposta } = await cliente.auth.getSession()
  if (!resposta.session) return navigateTo('/admin/login')
})
