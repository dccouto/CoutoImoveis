import type { Imovel } from '~/tipos/imovel'
import { encurtarTexto, formatarArea, formatarPreco, rotuloTipo } from '~/utils/formatar'

export function normalizarWhatsapp(numeroWhatsapp: string): string {
  const digitos = numeroWhatsapp.replace(/\D/g, '')
  if (!digitos) return ''
  if (digitos.startsWith('55')) return digitos
  return `55${digitos}`
}

export function validarNumeroWhatsapp(numeroWhatsapp: string): string | null {
  const digitos = numeroWhatsapp.replace(/\D/g, '')
  if (!digitos) return null
  if (digitos.length < 10 || digitos.length > 15) {
    return 'Informe DDD e número, com 10 a 15 dígitos.'
  }
  return null
}

export function montarLegendaWhatsapp(imovel: Imovel, urlPagina: string): string {
  const lugar = imovel.bairro.trim() || imovel.titulo.trim()
  const descricaoCurta = encurtarTexto(imovel.descricao, 320)
  const linhas = [
    `🏠 *${rotuloTipo(imovel.tipo)} à venda — ${lugar}*`,
    `📍 ${imovel.cidade.trim()}`,
    `💰 ${formatarPreco(imovel.precoCentavos)}`,
    `🛏 ${imovel.quartos} quartos · ${imovel.banheiros} banheiros · ${imovel.vagas} vagas · ${formatarArea(imovel.areaM2)} m²`,
  ]
  if (descricaoCurta) linhas.push('', descricaoCurta)
  linhas.push('', `Veja as fotos: ${urlPagina}`)
  return linhas.join('\n')
}

export function montarTextoContato(imovel: Imovel, urlPagina: string): string {
  const lugar = [imovel.bairro, imovel.cidade].filter(Boolean).join(', ')
  return `Olá! Tenho interesse no imóvel *${imovel.titulo}* (${lugar}) por ${formatarPreco(imovel.precoCentavos)}. ${urlPagina}`
}

export function montarLinkWhatsapp(numeroWhatsapp: string, texto: string): string {
  const consulta = `text=${encodeURIComponent(texto)}`
  const numero = normalizarWhatsapp(numeroWhatsapp)
  if (!numero) return `https://wa.me/?${consulta}`
  return `https://wa.me/${numero}?${consulta}`
}
