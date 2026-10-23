import type {
  Configuracao,
  DadosImovel,
  FotoImovel,
  Imovel,
  LinhaConfiguracao,
  LinhaFoto,
  LinhaImovel,
} from '~/tipos/imovel'

export function mapearFoto(linha: LinhaFoto): FotoImovel {
  return {
    id: linha.id,
    imovelId: linha.imovel_id,
    caminho: linha.caminho,
    capa: Boolean(linha.capa),
    ordem: Number(linha.ordem) || 0,
  }
}

export function mapearImovel(linha: LinhaImovel): Imovel {
  const fotos = (linha.fotos_imovel ?? [])
    .map((linhaFoto) => mapearFoto(linhaFoto))
    .sort((fotoA, fotoB) => fotoA.ordem - fotoB.ordem || fotoA.id.localeCompare(fotoB.id))

  return {
    id: linha.id,
    titulo: linha.titulo,
    tipo: linha.tipo,
    status: linha.status,
    precoCentavos: Number(linha.preco_centavos),
    descricao: linha.descricao ?? '',
    bairro: linha.bairro ?? '',
    cidade: linha.cidade ?? '',
    quartos: Number(linha.quartos) || 0,
    banheiros: Number(linha.banheiros) || 0,
    vagas: Number(linha.vagas) || 0,
    areaM2: Number(linha.area_m2) || 0,
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em,
    fotos,
  }
}

export function mapearConfiguracao(linha: LinhaConfiguracao): Configuracao {
  return {
    id: linha.id,
    numeroWhatsapp: linha.numero_whatsapp ?? '',
    nomeExibido: linha.nome_exibido?.trim() || 'Couto Imóveis',
  }
}

export function paraColunasImovel(dados: DadosImovel) {
  return {
    titulo: dados.titulo.trim(),
    tipo: dados.tipo,
    status: dados.status,
    preco_centavos: dados.precoCentavos,
    descricao: dados.descricao.trim(),
    bairro: dados.bairro.trim(),
    cidade: dados.cidade.trim(),
    quartos: dados.quartos,
    banheiros: dados.banheiros,
    vagas: dados.vagas,
    area_m2: dados.areaM2,
  }
}
