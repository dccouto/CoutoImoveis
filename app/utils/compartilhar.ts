import type { Imovel } from '~/tipos/imovel'
import { encurtarTexto, formatarPreco } from '~/utils/formatar'
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

function avisoComLegenda(avisoBase: string, copiou: boolean, legenda: string): ResultadoCompartilhar {
  return {
    aviso: copiou ? avisoBase : `${avisoBase} Se a cópia automática falhar, use a legenda abaixo.`,
    legendaVisivel: copiou ? '' : legenda,
  }
}

function quebrarLinhas(contexto: CanvasRenderingContext2D, texto: string, larguraMaxima: number) {
  const palavras = texto.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  const linhas: string[] = []
  let linhaAtual = ''
  for (const palavra of palavras) {
    const candidata = linhaAtual ? `${linhaAtual} ${palavra}` : palavra
    if (contexto.measureText(candidata).width <= larguraMaxima) {
      linhaAtual = candidata
      continue
    }
    if (linhaAtual) linhas.push(linhaAtual)
    linhaAtual = palavra
  }
  if (linhaAtual) linhas.push(linhaAtual)
  return linhas
}

async function montarCapaComFaixa(arquivo: File, imovel: Imovel): Promise<{ arquivo: File, comFaixa: boolean }> {
  let bitmap: ImageBitmap | null = null
  try {
    bitmap = await createImageBitmap(arquivo)
    const largura = Math.min(bitmap.width, 1080)
    const escala = largura / bitmap.width
    const alturaFoto = Math.max(1, Math.round(bitmap.height * escala))
    const alturaFaixa = Math.round(Math.max(210, largura * 0.34))
    const canvas = document.createElement('canvas')
    canvas.width = largura
    canvas.height = alturaFoto + alturaFaixa
    const contexto = canvas.getContext('2d')
    if (!contexto) return { arquivo, comFaixa: false }

    contexto.drawImage(bitmap, 0, 0, largura, alturaFoto)
    contexto.fillStyle = '#1b3a2f'
    contexto.fillRect(0, alturaFoto, largura, alturaFaixa)
    contexto.fillStyle = '#b5522a'
    contexto.fillRect(0, alturaFoto, largura, Math.max(4, Math.round(largura * 0.007)))

    const margem = Math.round(largura * 0.05)
    const larguraTexto = largura - margem * 2
    let linhaY = alturaFoto + Math.round(largura * 0.07)
    const titulo = imovel.titulo.trim()
    const preco = formatarPreco(imovel.precoCentavos)
    const lugar = [imovel.bairro.trim(), imovel.cidade.trim()].filter(Boolean).join(' · ')
    const descricao = encurtarTexto(imovel.descricao, 90)

    contexto.fillStyle = '#f6f1e8'
    contexto.font = `600 ${Math.round(largura * 0.042)}px Georgia, "Times New Roman", serif`
    for (const linha of quebrarLinhas(contexto, titulo, larguraTexto).slice(0, 2)) {
      contexto.fillText(linha, margem, linhaY)
      linhaY += Math.round(largura * 0.052)
    }

    contexto.fillStyle = '#f0d3c4'
    contexto.font = `700 ${Math.round(largura * 0.04)}px "Source Sans 3", system-ui, sans-serif`
    contexto.fillText(preco, margem, linhaY)
    linhaY += Math.round(largura * 0.05)

    contexto.fillStyle = '#efe4d4'
    contexto.font = `600 ${Math.round(largura * 0.03)}px "Source Sans 3", system-ui, sans-serif`
    const linhaLugar = quebrarLinhas(contexto, lugar, larguraTexto)[0]
    if (linhaLugar) {
      contexto.fillText(linhaLugar, margem, linhaY)
      linhaY += Math.round(largura * 0.046)
    }

    if (descricao) {
      contexto.font = `400 ${Math.round(largura * 0.026)}px "Source Sans 3", system-ui, sans-serif`
      for (const linha of quebrarLinhas(contexto, descricao, larguraTexto).slice(0, 2)) {
        contexto.fillText(linha, margem, linhaY)
        linhaY += Math.round(largura * 0.036)
      }
    }

    const blob = await new Promise<Blob | null>((resolver) => {
      canvas.toBlob(resultado => resolver(resultado), 'image/jpeg', 0.9)
    })
    if (!blob) return { arquivo, comFaixa: false }
    return {
      arquivo: new File([blob], `capa-${imovel.id}.jpg`, { type: 'image/jpeg' }),
      comFaixa: true,
    }
  }
  catch {
    return { arquivo, comFaixa: false }
  }
  finally {
    bitmap?.close()
  }
}

async function executarCompartilhamento(
  imovel: Imovel,
  urlCapa: string | null,
  urlPagina: string,
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
    window.open(montarLinkWhatsapp('', legenda), '_blank', 'noopener')

    if (!arquivoCapa) {
      return avisoComLegenda(
        'Não foi possível anexar a foto de capa. A legenda foi copiada e o WhatsApp abriu só com o texto.',
        copiou,
        legenda,
      )
    }

    return avisoComLegenda(
      'No computador, anexe a foto baixada no WhatsApp. No celular, o botão manda foto e texto juntos.',
      copiou,
      legenda,
    )
  }
  catch (erroCapturado) {
    if (erroCapturado instanceof DOMException && erroCapturado.name === 'AbortError') return vazio
    return {
      aviso: 'Não foi possível compartilhar agora. Tente de novo.',
      legendaVisivel: legenda,
    }
  }
}

async function executarCompartilhamentoFacebook(
  imovel: Imovel,
  urlCapa: string | null,
  urlPagina: string,
): Promise<ResultadoCompartilhar> {
  const legenda = montarLegendaWhatsapp(imovel, urlPagina)
  const vazio: ResultadoCompartilhar = { aviso: '', legendaVisivel: '' }

  try {
    let arquivoCapa: File | null = null
    let comFaixa = false
    if (urlCapa) {
      try {
        arquivoCapa = await baixarCapa(urlCapa, imovel.id)
      }
      catch {
        arquivoCapa = null
      }
    }
    if (arquivoCapa) {
      const preparada = await montarCapaComFaixa(arquivoCapa, imovel)
      arquivoCapa = preparada.arquivo
      comFaixa = preparada.comFaixa
    }

    const copiou = await copiarTexto(legenda)
    const avisoGrupo = comFaixa
      ? 'Se o grupo abrir só com a foto, o texto já está copiado para colar. Os dados principais também estão na imagem.'
      : 'Se o grupo abrir só com a foto, o texto já está copiado para colar.'

    if (arquivoCapa && podeCompartilharArquivo(arquivoCapa, imovel.titulo, legenda)) {
      await navigator.share({
        files: [arquivoCapa],
        title: imovel.titulo,
        text: legenda,
      })
      return avisoComLegenda(avisoGrupo, copiou, legenda)
    }

    if (arquivoCapa) baixarArquivo(arquivoCapa)
    window.open('https://www.facebook.com/groups/', '_blank', 'noopener')

    if (!arquivoCapa) {
      return avisoComLegenda(
        'Não foi possível baixar a foto de capa. A legenda foi copiada para colar no grupo. O Facebook não recebe a imagem por link.',
        copiou,
        legenda,
      )
    }

    return avisoComLegenda(
      'No computador, anexe a foto baixada no grupo. O Facebook não recebe a imagem por link.',
      copiou,
      legenda,
    )
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
  return executarCompartilhamento(imovel, urlCapa, urlPagina)
}

export function compartilharNoFacebook(imovel: Imovel, urlCapa: string | null, urlPagina: string) {
  return executarCompartilhamentoFacebook(imovel, urlCapa, urlPagina)
}
