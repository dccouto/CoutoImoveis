import type { Imovel } from '~/tipos/imovel'
import { montarLegendaWhatsapp, montarLinkWhatsapp } from '~/utils/whatsapp'

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

export function useCompartilharWhatsapp() {
  const aviso = ref('')
  const legendaVisivel = ref('')
  const enviando = ref(false)

  async function compartilharNoWhatsapp(imovel: Imovel, urlCapa: string | null, urlPagina: string) {
    aviso.value = ''
    legendaVisivel.value = ''
    enviando.value = true
    const legenda = montarLegendaWhatsapp(imovel, urlPagina)

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
        return
      }

      const copiou = await copiarTexto(legenda)
      if (arquivoCapa) baixarArquivo(arquivoCapa)
      window.open(montarLinkWhatsapp('', legenda), '_blank', 'noopener')
      if (!copiou) legendaVisivel.value = legenda

      if (arquivoCapa) {
        aviso.value = 'No computador, anexe a foto baixada no WhatsApp. No celular, o botão manda foto e texto juntos.'
      }
      else {
        aviso.value = 'Não foi possível anexar a foto de capa. A legenda foi copiada e o WhatsApp abriu só com o texto.'
      }
      if (!copiou) aviso.value += ' Se a cópia automática falhar, use a legenda abaixo.'
    }
    catch (erroCapturado) {
      if (erroCapturado instanceof DOMException && erroCapturado.name === 'AbortError') return
      aviso.value = 'Não foi possível compartilhar agora. Tente de novo.'
      legendaVisivel.value = legenda
    }
    finally {
      enviando.value = false
    }
  }

  return { aviso, legendaVisivel, enviando, compartilharNoWhatsapp }
}
