import type { Imovel } from '~/tipos/imovel'
import { montarLegendaWhatsapp, montarLinkWhatsapp } from '~/utils/whatsapp'

export interface ResultadoCompartilhar {
  aviso: string
  legendaVisivel: string
}

function getExtensaoDoTipo(tipo: string) {
  if (tipo.includes('png')) return 'png'
  if (tipo.includes('webp')) return 'webp'
  return 'jpg'
}

async function baixarCapa(urlCapa: string, imovelId: string): Promise<File> {
  const resposta = await fetch(urlCapa)
  if (!resposta.ok) throw new Error('foto')
  const conteudo = await resposta.blob()
  const tipo = conteudo.type || 'image/jpeg'
  return new File([conteudo], `capa-${imovelId}.${getExtensaoDoTipo(tipo)}`, { type: tipo })
}

function podeCompartilharArquivo(arquivo: File, titulo: string, texto: string) {
  if (typeof navigator === 'undefined') return false
  if (typeof navigator.canShare !== 'function' || typeof navigator.share !== 'function') return false
  try {
    return navigator.canShare({ files: [arquivo], title: titulo, text: texto })
  }
  catch {
    return false
  }
}

function baixarArquivo(arquivo: File) {
  const endereco = URL.createObjectURL(arquivo)
  const link = document.createElement('a')
  link.href = endereco
  link.download = arquivo.name
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(endereco)
}

async function copiarTexto(texto: string) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  }
  catch {
    return false
  }
}

function avisoSemArquivo(destino: 'whatsapp' | 'facebook', copiou: boolean): ResultadoCompartilhar {
  const avisoBase = destino === 'facebook'
    ? 'Não foi possível baixar a foto de capa. A legenda foi copiada para colar no grupo. O Facebook não recebe a imagem por link.'
    : 'Não foi possível anexar a foto de capa. A legenda foi copiada e o WhatsApp abriu só com o texto.'
  return {
    aviso: copiou ? avisoBase : `${avisoBase} Se a cópia automática falhar, use a legenda abaixo.`,
    legendaVisivel: copiou ? '' : '',
  }
}

async function executarCompartilhamento(
  imovel: Imovel,
  urlCapa: string | null,
  urlPagina: string,
  destino: 'whatsapp' | 'facebook',
): Promise<ResultadoCompartilhar> {
  const legenda = montarLegendaWhatsapp(imovel, urlPagina)
  const vazio: ResultadoCompartilhar = { aviso: '', legendaVisivel: '' }

  try {
    let arquivoCapa: File | null = null
    if (urlCapa) {
      try {
        arquivoCapa = await baixarCapa(urlCapa, imovel.id)
      }
      catch {
        arquivoCapa = null
      }
    }

    if (arquivoCapa && podeCompartilharArquivo(arquivoCapa, imovel.titulo, legenda)) {
      await navigator.share({
        files: [arquivoCapa],
        title: imovel.titulo,
        text: legenda,
      })
      return vazio
    }

    const copiou = await copiarTexto(legenda)
    if (arquivoCapa) baixarArquivo(arquivoCapa)

    if (destino === 'facebook') {
      window.open('https://www.facebook.com/groups/', '_blank', 'noopener')
    }
    else {
      window.open(montarLinkWhatsapp('', legenda), '_blank', 'noopener')
    }

    if (!arquivoCapa) {
      const resultado = avisoSemArquivo(destino, copiou)
      if (!copiou) resultado.legendaVisivel = legenda
      return resultado
    }

    const avisoBase = destino === 'facebook'
      ? 'No computador, anexe a foto baixada no grupo. O Facebook não recebe a imagem por link.'
      : 'No computador, anexe a foto baixada no WhatsApp. No celular, o botão manda foto e texto juntos.'
    return {
      aviso: copiou ? avisoBase : `${avisoBase} Se a cópia automática falhar, use a legenda abaixo.`,
      legendaVisivel: copiou ? '' : legenda,
    }
  }
  catch (erroCapturado) {
    if (erroCapturado instanceof DOMException && erroCapturado.name === 'AbortError') return vazio
    return {
      aviso: 'Não foi possível compartilhar agora. Tente de novo.',
      legendaVisivel: legenda,
    }
  }
}

export function compartilharNoWhatsapp(imovel: Imovel, urlCapa: string | null, urlPagina: string) {
  return executarCompartilhamento(imovel, urlCapa, urlPagina, 'whatsapp')
}

export function compartilharNoFacebook(imovel: Imovel, urlCapa: string | null, urlPagina: string) {
  return executarCompartilhamento(imovel, urlCapa, urlPagina, 'facebook')
}
