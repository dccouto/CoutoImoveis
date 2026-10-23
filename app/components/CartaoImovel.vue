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
  <article class="group h-full overflow-hidden rounded-3xl bg-papel shadow-sm ring-1 ring-linha transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
    <NuxtLink :to="`/imovel/${imovel.id}`" class="flex h-full flex-col rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota-600">
      <div class="relative aspect-[4/3] overflow-hidden bg-areia-100">
        <img
          v-if="urlCapa"
          :src="urlCapa"
          :alt="`Foto de capa de ${imovel.titulo}`"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        >
        <div v-else class="flex h-full items-end bg-gradient-to-t from-floresta-900/80 to-areia-100 p-4 text-sm text-areia-50">
          Sem foto ainda
        </div>
        <div class="absolute left-3 top-3 flex gap-2">
          <span class="inline-flex h-8 items-center rounded-full bg-papel/95 px-3 text-xs font-semibold uppercase tracking-wide text-floresta-900">
            {{ rotuloTipo(imovel.tipo) }}
          </span>
          <SeloStatus v-if="imovel.status === 'vendido'" status="vendido" />
        </div>
      </div>
      <div class="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <p class="font-serif text-2xl leading-tight text-floresta-900">{{ imovel.titulo }}</p>
        <p class="text-xl font-semibold text-terracota-700">{{ formatarPreco(imovel.precoCentavos) }}</p>
        <p class="text-sm text-apagado">{{ imovel.bairro }} · {{ imovel.cidade }}</p>
        <p class="mt-auto pt-2 text-sm text-tinta">
          {{ imovel.quartos }} quartos · {{ imovel.banheiros }} banheiros · {{ imovel.vagas }} vagas · {{ formatarArea(imovel.areaM2) }} m²
        </p>
      </div>
    </NuxtLink>
  </article>
</template>
