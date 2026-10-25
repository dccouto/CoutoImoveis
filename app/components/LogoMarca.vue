<script lang="ts">
export default {
  props: {
    nome: { type: String, default: '' },
    tom: { type: String, default: 'claro' },
  },
  computed: {
    nomeVisivel(): string {
      return this.nome.trim() || 'Couto Imóveis'
    },
    partesNome(): { primeira: string, resto: string } {
      const corte = this.nomeVisivel.indexOf(' ')
      if (corte <= 0) return { primeira: this.nomeVisivel, resto: '' }
      return {
        primeira: this.nomeVisivel.slice(0, corte),
        resto: this.nomeVisivel.slice(corte + 1),
      }
    },
    clara(): boolean {
      return this.tom !== 'escuro'
    },
  },
}
</script>

<template>
  <span class="inline-flex min-w-0 items-center gap-2.5">
    <svg class="h-9 w-9 shrink-0 sm:h-10 sm:w-10" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#1B3A2F"/>
      <path fill="#F4EFE6" d="M16 5.2 27.6 15v12.4H4.4V15L16 5.2Z"/>
      <path fill="#1B3A2F" d="M16 9.1 23.4 15.4v8.6H8.6v-8.6L16 9.1Z"/>
      <path fill="#C45C26" d="M14.1 24V18.2h3.8V24z"/>
    </svg>
    <span class="min-w-0 leading-none" :class="clara ? 'text-areia-50' : 'text-floresta-900'">
      <span class="block truncate font-serif text-[1.15rem] tracking-tight sm:text-xl">{{ partesNome.primeira }}</span>
      <span
        v-if="partesNome.resto"
        class="mt-0.5 block truncate text-[0.68rem] font-medium uppercase tracking-[0.16em]"
        :class="clara ? 'text-areia-100' : 'text-terracota-700'"
      >{{ partesNome.resto }}</span>
    </span>
  </span>
</template>
