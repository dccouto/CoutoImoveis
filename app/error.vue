<script setup lang="ts">
defineProps<{
  error: {
    statusCode?: number
    message?: string
  }
}>()
</script>

<template>
  <main class="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4">
    <LogoMarca nome="Couto Imóveis" tom="escuro" />
    <h1 class="mt-6 font-serif text-4xl text-floresta-900">Página não encontrada</h1>
    <p class="mt-3 text-apagado">O endereço não corresponde a um anúncio ou a uma tela do painel.</p>
    <NuxtLink to="/" class="mt-6 inline-flex min-h-11 items-center self-start rounded-full bg-floresta-800 px-5 text-areia-50">
      Voltar ao catálogo
    </NuxtLink>
  </main>
</template>
