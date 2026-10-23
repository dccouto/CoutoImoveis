<script setup lang="ts">
const { configuracao, carregarConfiguracao } = useConfiguracaoPublica()

onMounted(() => {
  carregarConfiguracao()
})
</script>

<template>
  <footer class="mt-20 bg-floresta-900 text-areia-50">
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <LogoMarca :nome="configuracao.nomeExibido" tom="claro" />
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-areia-100">
          Casas e apartamentos à venda, com foto, preço e endereço.
        </p>
      </div>
      <NuxtLink to="/" class="inline-flex h-11 items-center text-sm text-areia-50 underline-offset-4 hover:underline">
        Ver o catálogo
      </NuxtLink>
    </div>
  </footer>
</template>
