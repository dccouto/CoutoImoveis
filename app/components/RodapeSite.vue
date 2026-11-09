<script lang="ts">
import { carregarConfiguracao, estadoConfiguracao } from '~/estado/configuracaoPublica'
import { montarLinkWhatsapp, normalizarWhatsapp } from '~/utils/whatsapp'

const MENSAGEM_SITE_PARECIDO =
  'Olá! Vi o site da Couto Imóveis e quero um site parecido para o meu negócio. Podemos conversar?'

export default {
  computed: {
    nomeExibido(): string {
      return estadoConfiguracao.nomeExibido
    },
    temWhatsapp(): boolean {
      return Boolean(normalizarWhatsapp(estadoConfiguracao.numeroWhatsapp))
    },
    linkSiteParecido(): string {
      return montarLinkWhatsapp(estadoConfiguracao.numeroWhatsapp, MENSAGEM_SITE_PARECIDO)
    },
  },
  mounted() {
    carregarConfiguracao(this.$supabase)
  },
}
</script>

<template>
  <footer class="mt-20 bg-floresta-900 text-areia-50">
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <LogoMarca :nome="nomeExibido" tom="claro" />
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-areia-100">
          Casas e apartamentos à venda, com foto, preço e endereço.
        </p>
        <p v-if="temWhatsapp" class="mt-5 max-w-sm text-xs leading-relaxed text-areia-100/70">
          Quer um site como este para o seu negócio?
          <a
            :href="linkSiteParecido"
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-2 transition hover:text-areia-50"
          >
            Fale conosco
          </a>
        </p>
      </div>
      <NuxtLink to="/" class="inline-flex h-11 items-center text-sm text-areia-50 underline-offset-4 hover:underline">
        Ver o catálogo
      </NuxtLink>
    </div>
  </footer>
</template>
