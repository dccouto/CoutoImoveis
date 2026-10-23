<script setup lang="ts">
defineProps<{
  painel?: boolean
}>()

const { configuracao, carregarConfiguracao } = useConfiguracaoPublica()
const { sair } = useSessao()

onMounted(() => {
  carregarConfiguracao()
})
</script>

<template>
  <header class="bg-floresta-900 text-areia-50">
    <div class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
      <NuxtLink to="/" class="inline-flex min-h-11 items-center gap-3">
        <span aria-hidden="true" class="grid h-10 w-10 place-items-center rounded-full bg-terracota-600 text-lg">⌂</span>
        <span class="font-serif text-2xl leading-none">{{ configuracao.nomeExibido }}</span>
      </NuxtLink>
      <nav class="flex flex-wrap items-center justify-end gap-1" :aria-label="painel ? 'Painel do anunciante' : 'Site'">
        <template v-if="painel">
          <NuxtLink to="/admin" class="inline-flex min-h-11 items-center rounded-full px-3 text-sm hover:bg-white/10">
            Imóveis
          </NuxtLink>
          <NuxtLink to="/admin/configuracoes" class="inline-flex min-h-11 items-center rounded-full px-3 text-sm hover:bg-white/10">
            WhatsApp
          </NuxtLink>
          <NuxtLink to="/" class="inline-flex min-h-11 items-center rounded-full px-3 text-sm hover:bg-white/10">
            Ver site
          </NuxtLink>
          <button type="button" class="inline-flex min-h-11 items-center rounded-full border border-areia-50/40 px-4 text-sm" @click="sair">
            Sair
          </button>
        </template>
        <NuxtLink v-else to="/admin" class="inline-flex min-h-11 items-center rounded-full border border-areia-50/40 px-4 text-sm">
          Área do anunciante
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
