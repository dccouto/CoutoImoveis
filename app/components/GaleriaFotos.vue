<script setup lang="ts">
import type { ItemGaleria } from '~/tipos/imovel'

const propriedades = defineProps<{
  itens: ItemGaleria[]
  titulo: string
}>()

const indiceAtual = ref(0)
const fotoAtual = computed(() => propriedades.itens[indiceAtual.value] ?? null)

watch(() => propriedades.itens.length, () => {
  indiceAtual.value = 0
})

function selecionarFoto(indice: number) {
  indiceAtual.value = indice
}
</script>

<template>
  <div>
    <div class="overflow-hidden rounded-3xl bg-areia-100">
      <img
        v-if="fotoAtual"
        :src="fotoAtual.url"
        :alt="fotoAtual.alt"
        class="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
      >
      <div v-else class="flex aspect-[4/3] items-end p-6 text-apagado sm:aspect-[16/10]">
        {{ titulo }} ainda não tem fotos.
      </div>
    </div>
    <div v-if="itens.length > 1" class="mt-3 flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(miniatura, indice) in itens"
        :key="miniatura.id"
        type="button"
        class="h-20 w-24 shrink-0 overflow-hidden rounded-2xl ring-2 ring-offset-2 ring-offset-areia-50"
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
