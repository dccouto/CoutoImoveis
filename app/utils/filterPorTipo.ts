import type { FiltroTipo, Imovel } from '~/tipos/imovel'

export function filterPorTipo(listaImoveis: Imovel[], filtroTipo: FiltroTipo): Imovel[] {
  if (filtroTipo === 'todos') return listaImoveis
  return listaImoveis.filter((imovel) => imovel.tipo === filtroTipo)
}
