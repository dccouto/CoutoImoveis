<script setup lang="ts">
const { configuracao, carregarConfiguracao } = useConfiguracaoPublica()

onMounted(() => {
  carregarConfiguracao()
})
</script>

<template>
  <footer class="mt-16 border-t border-linha">
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-apagado">
      <p class="font-serif text-lg text-floresta-800">{{ configuracao.nomeExibido }}</p>
      <p>Casas e apartamentos à venda.</p>
    </div>
  </footer>
</template>
