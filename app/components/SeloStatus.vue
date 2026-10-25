<script lang="ts">
import type { PropType } from 'vue'
import type { StatusImovel } from '~/tipos/imovel'

export default {
  props: {
    status: { type: String as PropType<StatusImovel>, required: true },
  },
  computed: {
    classe(): string {
      if (this.status === 'vendido') return 'bg-apagado text-areia-50'
      if (this.status === 'rascunho') return 'bg-areia-100 text-tinta'
      return 'bg-floresta-800 text-areia-50'
    },
  },
}
</script>

<template>
  <span class="inline-flex min-h-8 items-center rounded-full px-3 text-xs font-medium uppercase tracking-wide" :class="classe">
    {{ rotuloStatus(status) }}
  </span>
</template>
