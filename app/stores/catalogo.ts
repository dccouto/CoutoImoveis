import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FiltroTipo } from '~/tipos/imovel'

export const useCatalogo = defineStore('catalogo', () => {
  const filtroTipo = ref<FiltroTipo>('todos')

  function setFiltroTipo(valor: FiltroTipo) {
    filtroTipo.value = valor
  }

  return { filtroTipo, setFiltroTipo }
})
