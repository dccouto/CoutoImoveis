import type { SupabaseClient } from '@supabase/supabase-js'

export function useClienteSupabase() {
  const aplicacao = useNuxtApp()
  const configPublica = useRuntimeConfig()
  const cliente = (aplicacao.$supabase ?? null) as SupabaseClient | null
  const configurado = computed(() => Boolean(configPublica.public.supabaseUrl && configPublica.public.supabaseKey && cliente))
  return { cliente, configurado }
}
