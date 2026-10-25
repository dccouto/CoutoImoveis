<script lang="ts">
import type { PropType } from 'vue'
import type { Imovel } from '~/tipos/imovel'
import { compartilharNoFacebook } from '~/utils/compartilhar'

export default {
  props: {
    imovel: { type: Object as PropType<Imovel>, required: true },
    urlCapa: { type: String as PropType<string | null>, default: null },
    urlPagina: { type: String, required: true },
  },
  data() {
    return {
      aviso: '',
      legendaVisivel: '',
      enviando: false,
    }
  },
  methods: {
    async aoCompartilhar() {
      this.enviando = true
      this.aviso = ''
      this.legendaVisivel = ''
      try {
        const resultado = await compartilharNoFacebook(this.imovel, this.urlCapa, this.urlPagina)
        this.aviso = resultado.aviso
        this.legendaVisivel = resultado.legendaVisivel
      }
      finally {
        this.enviando = false
      }
    },
  },
}
</script>

<template>
  <div class="w-full sm:w-auto">
    <button
      type="button"
      class="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-floresta-800 bg-papel px-6 text-base font-semibold text-floresta-800 shadow-sm transition hover:bg-floresta-800 hover:text-areia-50 disabled:opacity-60 sm:w-auto"
      :disabled="enviando"
      aria-label="Compartilhar no Facebook"
      @click="aoCompartilhar"
    >
      {{ enviando ? 'Preparando…' : 'Compartilhar no Facebook' }}
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
