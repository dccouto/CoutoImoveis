<script setup lang="ts">
import type { Imovel } from '~/tipos/imovel'

const propriedades = defineProps<{
  imovel: Imovel
}>()

const { cliente } = useClienteSupabase()
const capaAtual = computed(() => getCapa(propriedades.imovel.fotos))
const urlCapa = computed(() => {
  if (!cliente || !capaAtual.value) return ''
  return getUrlFoto(cliente, capaAtual.value.caminho)
})
</script>

<template>
  <article class="overflow-hidden rounded-3xl bg-papel shadow-sm ring-1 ring-linha">
    <NuxtLink :to="`/imovel/${imovel.id}`" class="block">
      <div class="relative aspect-[4/3] bg-areia-100">
        <img
          v-if="urlCapa"
          :src="urlCapa"
          :alt="`Foto de capa de ${imovel.titulo}`"
          class="h-full w-full object-cover"
        >
        <div v-else class="flex h-full items-end p-4 text-sm text-apagado">
          Sem foto
        </div>
        <div v-if="imovel.status === 'vendido'" class="absolute left-3 top-3">
          <SeloStatus status="vendido" />
        </div>
      </div>
      <div class="space-y-2 p-4">
        <p class="text-sm uppercase tracking-wide text-apagado">{{ rotuloTipo(imovel.tipo) }}</p>
        <h2 class="text-2xl leading-tight text-floresta-900">{{ imovel.titulo }}</h2>
        <p class="text-xl font-medium text-terracota-700">{{ formatarPreco(imovel.precoCentavos) }}</p>
        <p class="text-apagado">{{ imovel.bairro }} · {{ imovel.cidade }}</p>
        <p class="text-sm text-tinta">
          {{ imovel.quartos }} quartos · {{ imovel.banheiros }} banheiros · {{ imovel.vagas }} vagas · {{ formatarArea(imovel.areaM2) }} m²
        </p>
      </div>
    </NuxtLink>
  </article>
</template>
