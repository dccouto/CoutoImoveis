<script setup lang="ts">
defineProps<{
  aberto: boolean
  titulo: string
  mensagem: string
}>()

const emitir = defineEmits<{
  confirmar: []
  cancelar: []
}>()
</script>

<template>
  <div
    v-if="aberto"
    class="fixed inset-0 z-40 flex items-end justify-center bg-floresta-900/50 p-4 sm:items-center"
    @click.self="emitir('cancelar')"
    @keydown.esc="emitir('cancelar')"
  >
    <div role="dialog" aria-modal="true" :aria-label="titulo" class="w-full max-w-md rounded-3xl bg-papel p-5 shadow-xl" tabindex="-1">
      <h2 class="text-3xl text-floresta-900">{{ titulo }}</h2>
      <p class="mt-2 text-apagado">{{ mensagem }}</p>
      <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="inline-flex min-h-11 items-center justify-center rounded-full border border-linha px-5" @click="emitir('cancelar')">
          Cancelar
        </button>
        <button type="button" class="inline-flex min-h-11 items-center justify-center rounded-full bg-terracota-600 px-5 text-white" @click="emitir('confirmar')">
          Excluir
        </button>
      </div>
    </div>
  </div>
</template>
