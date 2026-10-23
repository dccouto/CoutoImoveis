import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Configuracao,
  DadosImovel,
  FotoImovel,
  FotoParaEnviar,
  Imovel,
  LinhaConfiguracao,
  LinhaFoto,
  LinhaImovel,
  StatusImovel,
} from '~/tipos/imovel'
import { getExtensao, validarFoto } from '~/utils/fotos'
import { mapearConfiguracao, mapearImovel, paraColunasImovel } from '~/utils/mapearImovel'
import { traduzirErro } from '~/utils/traduzirErro'

function lancarSeErro(erro: { code?: string, message?: string } | null) {
  if (erro) throw new Error(traduzirErro(erro))
}

export function useImoveis() {
  const { cliente } = useClienteSupabase()

  function garantirCliente(): SupabaseClient {
    if (!cliente) {
      throw new Error('Configure o Supabase com NUXT_PUBLIC_SUPABASE_URL e NUXT_PUBLIC_SUPABASE_KEY.')
    }
    return cliente
  }

  async function getImoveis(statusAlvo?: StatusImovel): Promise<Imovel[]> {
    const supabase = garantirCliente()
    let consulta = supabase
      .from('imoveis')
      .select('*, fotos_imovel(*)')
      .order('criado_em', { ascending: false })

    if (statusAlvo) consulta = consulta.eq('status', statusAlvo)

    const { data: linhas, error: erro } = await consulta
    lancarSeErro(erro)
    return ((linhas ?? []) as LinhaImovel[]).map((linha) => mapearImovel(linha))
  }

  async function getImovel(id: string): Promise<Imovel | null> {
    const supabase = garantirCliente()
    const { data: linha, error: erro } = await supabase
      .from('imoveis')
      .select('*, fotos_imovel(*)')
      .eq('id', id)
      .maybeSingle()
    lancarSeErro(erro)
    if (!linha) return null
    return mapearImovel(linha as LinhaImovel)
  }

  async function salvarImovel(dados: DadosImovel, id?: string): Promise<Imovel> {
    const supabase = garantirCliente()
    const colunas = paraColunasImovel(dados)
    const consulta = id
      ? supabase.from('imoveis').update(colunas).eq('id', id)
      : supabase.from('imoveis').insert(colunas)
    const { data: linha, error: erro } = await consulta.select('*, fotos_imovel(*)').single()
    lancarSeErro(erro)
    return mapearImovel(linha as LinhaImovel)
  }

  async function excluirImovel(imovel: Imovel) {
    const supabase = garantirCliente()
    const caminhos = imovel.fotos.map((foto) => foto.caminho)
    if (caminhos.length) {
      const { error: erroArquivos } = await supabase.storage.from('imoveis').remove(caminhos)
      lancarSeErro(erroArquivos)
    }
    const { error: erroLinha } = await supabase.from('imoveis').delete().eq('id', imovel.id)
    lancarSeErro(erroLinha)
  }

  async function enviarFotos(
    imovelId: string,
    fotosParaEnviar: FotoParaEnviar[],
    ordemInicial = 0,
    definirCapaSeVazio = false,
  ) {
    const supabase = garantirCliente()
    if (!fotosParaEnviar.length) return

    for (const foto of fotosParaEnviar) {
      const mensagem = validarFoto(foto.arquivo)
      if (mensagem) throw new Error(mensagem)
    }

    let indiceCapa = fotosParaEnviar.findIndex((foto) => foto.capa)
    if (indiceCapa < 0 && definirCapaSeVazio) indiceCapa = 0

    const caminhosEnviados: string[] = []
    const linhasFoto: Array<{ imovel_id: string, caminho: string, capa: boolean, ordem: number }> = []

    for (const [indice, foto] of fotosParaEnviar.entries()) {
      const caminho = `${imovelId}/${crypto.randomUUID()}.${getExtensao(foto.arquivo.type)}`
      const { error: erroEnvio } = await supabase.storage.from('imoveis').upload(caminho, foto.arquivo, {
        contentType: foto.arquivo.type,
        upsert: false,
      })
      if (erroEnvio) {
        if (caminhosEnviados.length) await supabase.storage.from('imoveis').remove(caminhosEnviados)
        lancarSeErro(erroEnvio)
      }
      caminhosEnviados.push(caminho)
      linhasFoto.push({
        imovel_id: imovelId,
        caminho,
        capa: indice === indiceCapa,
        ordem: ordemInicial + indice,
      })
    }

    const { error: erroLinha } = await supabase.from('fotos_imovel').insert(linhasFoto)
    if (erroLinha) {
      await supabase.storage.from('imoveis').remove(caminhosEnviados)
      lancarSeErro(erroLinha)
    }
  }

  async function setCapa(imovelId: string, fotoId: string) {
    const supabase = garantirCliente()
    const { error: erroLimpar } = await supabase
      .from('fotos_imovel')
      .update({ capa: false })
      .eq('imovel_id', imovelId)
    lancarSeErro(erroLimpar)
    const { error: erroMarcar } = await supabase
      .from('fotos_imovel')
      .update({ capa: true })
      .eq('id', fotoId)
    lancarSeErro(erroMarcar)
  }

  async function moverFoto(fotos: FotoImovel[], fotoId: string, direcao: 'subir' | 'descer') {
    const ordenadas = [...fotos].sort((fotoA, fotoB) => fotoA.ordem - fotoB.ordem || fotoA.id.localeCompare(fotoB.id))
    const indice = ordenadas.findIndex((foto) => foto.id === fotoId)
    const destino = direcao === 'subir' ? indice - 1 : indice + 1
    if (indice < 0 || destino < 0 || destino >= ordenadas.length) return

    const reordenadas = [...ordenadas]
    const [fotoMovida] = reordenadas.splice(indice, 1)
    if (!fotoMovida) return
    reordenadas.splice(destino, 0, fotoMovida)

    const supabase = garantirCliente()
    for (const [novaOrdem, foto] of reordenadas.entries()) {
      if (foto.ordem === novaOrdem) continue
      const { error: erroOrdem } = await supabase.from('fotos_imovel').update({ ordem: novaOrdem }).eq('id', foto.id)
      lancarSeErro(erroOrdem)
    }
  }

  async function excluirFoto(foto: FotoImovel) {
    const supabase = garantirCliente()
    const { error: erroArquivo } = await supabase.storage.from('imoveis').remove([foto.caminho])
    lancarSeErro(erroArquivo)
    const { error: erroLinha } = await supabase.from('fotos_imovel').delete().eq('id', foto.id)
    lancarSeErro(erroLinha)

    if (!foto.capa) return

    const { data: restantes, error: erroLista } = await supabase
      .from('fotos_imovel')
      .select('*')
      .eq('imovel_id', foto.imovelId)
      .order('ordem', { ascending: true })
    lancarSeErro(erroLista)
    const listaRestante = (restantes ?? []) as LinhaFoto[]
    const aindaTemCapa = listaRestante.some((linha) => linha.capa)
    const primeira = listaRestante[0]
    if (!aindaTemCapa && primeira) await setCapa(foto.imovelId, primeira.id)
  }

  async function getConfiguracao(): Promise<Configuracao | null> {
    const supabase = garantirCliente()
    const { data: linha, error: erro } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
    lancarSeErro(erro)
    if (!linha) return null
    return mapearConfiguracao(linha as LinhaConfiguracao)
  }

  async function salvarConfiguracao(numeroWhatsapp: string, nomeExibido: string): Promise<Configuracao> {
    const supabase = garantirCliente()
    const { data: linha, error: erro } = await supabase
      .from('configuracoes')
      .update({
        numero_whatsapp: numeroWhatsapp.trim(),
        nome_exibido: nomeExibido.trim() || 'Couto Imóveis',
      })
      .eq('id', 1)
      .select('*')
      .single()
    lancarSeErro(erro)
    return mapearConfiguracao(linha as LinhaConfiguracao)
  }

  return {
    getImoveis,
    getImovel,
    salvarImovel,
    excluirImovel,
    enviarFotos,
    setCapa,
    moverFoto,
    excluirFoto,
    getConfiguracao,
    salvarConfiguracao,
  }
}
