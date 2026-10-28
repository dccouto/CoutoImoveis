import type { Imovel, OrdenacaoCatalogo } from '~/tipos/imovel'

function compararTipo(primeiro: Imovel, segundo: Imovel, tipoPrimeiro: 'casa' | 'apartamento'): number {
  if (primeiro.tipo === segundo.tipo) return 0
  if (primeiro.tipo === tipoPrimeiro) return -1
  if (segundo.tipo === tipoPrimeiro) return 1
  return 0
}

export function ordenarImoveis(listaImoveis: Imovel[], ordenacao: OrdenacaoCatalogo): Imovel[] {
  const ordenados = [...listaImoveis]

  switch (ordenacao) {
    case 'preco_menor':
      return ordenados.sort((primeiro, segundo) => primeiro.precoCentavos - segundo.precoCentavos)
    case 'preco_maior':
      return ordenados.sort((primeiro, segundo) => segundo.precoCentavos - primeiro.precoCentavos)
    case 'tipo_casa':
      return ordenados.sort((primeiro, segundo) => compararTipo(primeiro, segundo, 'casa'))
    case 'tipo_apartamento':
      return ordenados.sort((primeiro, segundo) => compararTipo(primeiro, segundo, 'apartamento'))
    default:
      return ordenados
  }
}
