<template>
  <div class="flex min-h-screen flex-col">
    <a href="#conteudo" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-papel focus:px-4 focus:py-2">
      Ir para o conteúdo
    </a>
    <CabecalhoSite painel />
    <main id="conteudo" class="flex-1">
      <slot />
    </main>
  </div>
</template>
