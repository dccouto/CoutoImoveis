<script lang="ts">
import type { PropType } from 'vue'
import type { ItemGaleria } from '~/tipos/imovel'

export default {
  props: {
    itens: { type: Array as PropType<ItemGaleria[]>, required: true },
    titulo: { type: String, required: true },
  },
  data() {
    return {
      indiceAtual: 0,
    }
  },
  computed: {
    fotoAtual(): ItemGaleria | null {
      return this.itens[this.indiceAtual] ?? null
    },
  },
  watch: {
    'itens.length'() {
      this.indiceAtual = 0
    },
  },
  methods: {
    selecionarFoto(indice: number) {
      this.indiceAtual = indice
    },
  },
}
</script>

<template>
  <div>
    <div class="overflow-hidden rounded-[1.75rem] bg-areia-100 shadow-sm ring-1 ring-linha">
      <img
        v-if="fotoAtual"
        :src="fotoAtual.url"
        :alt="fotoAtual.alt"
        class="aspect-[4/3] w-full object-cover sm:aspect-[16/9] sm:max-h-[36rem]"
      >
      <div v-else class="flex aspect-[4/3] items-end bg-gradient-to-t from-floresta-900/70 to-areia-100 p-6 text-areia-50 sm:aspect-[16/9]">
        {{ titulo }} ainda não tem fotos.
      </div>
    </div>
    <div v-if="itens.length > 1" class="mt-3 flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(miniatura, indice) in itens"
        :key="miniatura.id"
        type="button"
        class="h-20 w-28 shrink-0 overflow-hidden rounded-2xl ring-2 ring-offset-2 ring-offset-areia-50 sm:h-24 sm:w-32"
        :class="indice === indiceAtual ? 'ring-terracota-600' : 'ring-transparent'"
        :aria-label="`Mostrar foto ${indice + 1} de ${itens.length}`"
        :aria-current="indice === indiceAtual"
        @click="selecionarFoto(indice)"
      >
        <img :src="miniatura.url" :alt="miniatura.alt" class="h-full w-full object-cover">
      </button>
    </div>
  </div>
</template>
