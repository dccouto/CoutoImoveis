import type { StatusImovel, TipoImovel } from '~/tipos/imovel'

export function formatarPreco(precoCentavos: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(precoCentavos / 100)
}

export function formatarPrecoEntrada(precoCentavos: number): string {
  return (precoCentavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function parsePrecoReais(valor: string): number | null {
  const limpo = valor.trim().replace(/\s/g, '')
  if (!limpo) return null
  const comPonto = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo
  const numero = Number(comPonto)
  if (!Number.isFinite(numero) || numero < 0) return null
  return Math.round(numero * 100)
}

export function formatarArea(areaM2: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(areaM2)
}

export function encurtarTexto(texto: string, limite: number): string {
  const limpo = texto.replace(/\s+/g, ' ').trim()
  if (limpo.length <= limite) return limpo
  const corte = limpo.slice(0, limite)
  const ultimoEspaco = corte.lastIndexOf(' ')
  const base = ultimoEspaco > limite * 0.6 ? corte.slice(0, ultimoEspaco) : corte
  return `${base.trim()}…`
}

export function rotuloTipo(tipo: TipoImovel): string {
  return tipo === 'casa' ? 'Casa' : 'Apartamento'
}

export function rotuloStatus(status: StatusImovel): string {
  if (status === 'rascunho') return 'Rascunho'
  if (status === 'vendido') return 'Vendido'
  return 'Ativo'
}
