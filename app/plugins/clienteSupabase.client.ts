import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const configPublica = useRuntimeConfig()
  const url = configPublica.public.supabaseUrl
  const chave = configPublica.public.supabaseKey

  if (!url || !chave) {
    return {
      provide: {
        supabase: null,
      },
    }
  }

  const cliente = createClient(url, chave)
  return {
    provide: {
      supabase: cliente,
    },
  }
})
