<script setup lang="ts">
import type { Imovel } from '~/tipos/imovel'

const propriedades = defineProps<{
  imovel: Imovel
  numeroWhatsapp: string
  urlPagina: string
}>()

const linkContato = computed(() => {
  const texto = montarTextoContato(propriedades.imovel, propriedades.urlPagina)
  return montarLinkWhatsapp(propriedades.numeroWhatsapp, texto)
})

const temNumero = computed(() => Boolean(normalizarWhatsapp(propriedades.numeroWhatsapp)))
</script>

<template>
  <div class="w-full sm:w-auto">
    <a
      v-if="temNumero"
      :href="linkContato"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-floresta-800 px-5 text-center text-base font-medium text-areia-50 sm:w-auto"
    >
      Falar no WhatsApp
    </a>
    <div v-else>
      <button type="button" class="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-floresta-800/40 px-5 text-areia-50 sm:w-auto" disabled aria-describedby="aviso-whatsapp">
        Falar no WhatsApp
      </button>
      <p id="aviso-whatsapp" class="mt-2 max-w-sm text-sm text-apagado">
        O contato será ativado quando o anunciante salvar o WhatsApp.
      </p>
    </div>
  </div>
</template>
