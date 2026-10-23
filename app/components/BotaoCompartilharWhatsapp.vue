<script setup lang="ts">
import type { Imovel } from '~/tipos/imovel'

const propriedades = defineProps<{
  imovel: Imovel
  urlCapa: string | null
  urlPagina: string
}>()

const { aviso, legendaVisivel, enviando, compartilharNoWhatsapp } = useCompartilharWhatsapp()

function aoCompartilhar() {
  compartilharNoWhatsapp(propriedades.imovel, propriedades.urlCapa, propriedades.urlPagina)
}
</script>

<template>
  <div class="w-full sm:w-auto">
    <button
      type="button"
      class="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-floresta-800 bg-papel px-5 text-base font-medium text-floresta-800 disabled:opacity-60 sm:w-auto"
      :disabled="enviando"
      @click="aoCompartilhar"
    >
      {{ enviando ? 'Preparando…' : 'Compartilhar no WhatsApp' }}
    </button>
    <p v-if="aviso" class="mt-2 max-w-sm text-sm text-apagado" role="status">
      {{ aviso }}
    </p>
    <textarea
      v-if="legendaVisivel"
      readonly
      class="mt-2 min-h-36 w-full rounded-2xl border border-linha bg-papel p-3 text-sm"
      :value="legendaVisivel"
      aria-label="Legenda para copiar"
    />
  </div>
</template>
