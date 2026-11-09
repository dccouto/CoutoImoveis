<script lang="ts">
export default {
  name: 'MarcaDaguaVendido',
}
</script>

<template>
  <div
    class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
    aria-hidden="true"
  >
    <div class="absolute inset-x-[-20%] top-1/2 -translate-y-1/2 -rotate-12 bg-floresta-900/55 py-2 shadow-sm sm:py-3">
      <p
        class="text-center font-serif text-2xl font-semibold uppercase tracking-[0.28em] text-areia-50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] sm:text-3xl md:text-4xl"
      >
        VENDIDO
      </p>
    </div>
  </div>
</template>
