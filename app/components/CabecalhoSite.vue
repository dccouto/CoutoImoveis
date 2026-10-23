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
  <header class="min-w-0 border-b border-white/10 bg-floresta-900 text-areia-50">
    <div class="mx-auto flex h-16 w-full max-w-6xl min-w-0 items-center gap-3 px-4">
      <NuxtLink to="/" class="inline-flex min-h-11 min-w-0 items-center rounded-md" aria-label="Couto Imóveis, início">
        <LogoMarca :nome="configuracao.nomeExibido" tom="claro" />
      </NuxtLink>
      <nav
        class="ml-auto flex shrink-0 items-center gap-1 overflow-x-auto"
        :aria-label="painel ? 'Painel do anunciante' : 'Site'"
      >
        <template v-if="painel">
          <NuxtLink to="/admin" class="inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-sm hover:bg-white/10 sm:px-3">
            Imóveis
          </NuxtLink>
          <NuxtLink to="/admin/configuracoes" class="inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-sm hover:bg-white/10 sm:px-3">
            WhatsApp
          </NuxtLink>
          <NuxtLink to="/" class="inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-2.5 text-sm hover:bg-white/10 sm:px-3">
            Ver site
          </NuxtLink>
          <button type="button" class="inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-full border border-areia-50/30 px-3 text-sm" @click="sair">
            Sair
          </button>
        </template>
        <NuxtLink v-else to="/admin" class="inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-full border border-areia-50/35 px-3 text-sm sm:px-4">
          <span class="sm:hidden">Painel</span>
          <span class="hidden sm:inline">Área do anunciante</span>
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
