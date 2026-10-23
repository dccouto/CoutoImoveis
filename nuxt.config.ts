import tailwindcss from '@tailwindcss/vite'

function resolverUrlBase() {
  const bruta = process.env.NUXT_APP_BASE_URL || '/'
  if (bruta === '/') return '/'
  const comBarraInicial = bruta.startsWith('/') ? bruta : `/${bruta}`
  return comBarraInicial.endsWith('/') ? comBarraInicial : `${comBarraInicial}/`
}

const urlBase = resolverUrlBase()

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/principal.css'],
  app: {
    baseURL: urlBase,
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Couto Imóveis',
      meta: [
        { name: 'description', content: 'Casas e apartamentos à venda pela Couto Imóveis.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: `${urlBase}favicon.svg` },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,640&family=Outfit:wght@400;500;600&display=swap',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseKey: '',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  nitro: {
    preset: 'static',
  },
})
