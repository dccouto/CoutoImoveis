import type { SupabaseClient } from '@supabase/supabase-js'
import type { FotoImovel } from '~/tipos/imovel'

const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']
const tamanhoMaximo = 8 * 1024 * 1024

export function validarFoto(arquivo: File): string | null {
  if (!tiposPermitidos.includes(arquivo.type)) {
    return 'Envie apenas fotos JPEG, PNG ou WebP.'
  }
  if (arquivo.size > tamanhoMaximo) {
    return 'Cada foto pode ter no máximo 8 MB.'
  }
  return null
}

export function getExtensao(tipoArquivo: string): string {
  if (tipoArquivo === 'image/png') return 'png'
  if (tipoArquivo === 'image/webp') return 'webp'
  return 'jpg'
}

export function getCapa(fotos: FotoImovel[]): FotoImovel | null {
  if (!fotos.length) return null
  const ordenadas = [...fotos].sort((fotoA, fotoB) => fotoA.ordem - fotoB.ordem)
  return ordenadas.find((foto) => foto.capa) ?? ordenadas[0] ?? null
}

export function getUrlFoto(cliente: SupabaseClient, caminho: string): string {
  const { data: endereco } = cliente.storage.from('imoveis').getPublicUrl(caminho)
  return endereco.publicUrl
}
