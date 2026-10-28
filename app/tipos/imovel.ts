export type TipoImovel = 'casa' | 'apartamento'
export type StatusImovel = 'rascunho' | 'ativo' | 'vendido'
export type FiltroTipo = 'todos' | TipoImovel
export type OrdenacaoCatalogo = 'preco_menor' | 'preco_maior' | 'tipo_casa' | 'tipo_apartamento'

export interface FotoImovel {
  id: string
  imovelId: string
  caminho: string
  capa: boolean
  ordem: number
}

export interface Imovel {
  id: string
  titulo: string
  tipo: TipoImovel
  status: StatusImovel
  precoCentavos: number
  descricao: string
  bairro: string
  cidade: string
  quartos: number
  banheiros: number
  vagas: number
  areaM2: number
  criadoEm: string
  atualizadoEm: string
  fotos: FotoImovel[]
}

export interface DadosImovel {
  titulo: string
  tipo: TipoImovel
  status: StatusImovel
  precoCentavos: number
  descricao: string
  bairro: string
  cidade: string
  quartos: number
  banheiros: number
  vagas: number
  areaM2: number
}

export interface Configuracao {
  id: number
  numeroWhatsapp: string
  nomeExibido: string
}

export interface FotoNova {
  idLocal: string
  arquivo: File
  previa: string
  capa: boolean
}

export interface FotoParaEnviar {
  arquivo: File
  capa: boolean
}

export interface ItemGaleria {
  id: string
  url: string
  alt: string
}

export interface LinhaFoto {
  id: string
  imovel_id: string
  caminho: string
  capa: boolean
  ordem: number
}

export interface LinhaImovel {
  id: string
  titulo: string
  tipo: TipoImovel
  status: StatusImovel
  preco_centavos: number | string
  descricao: string | null
  bairro: string | null
  cidade: string | null
  quartos: number | string
  banheiros: number | string
  vagas: number | string
  area_m2: number | string
  criado_em: string
  atualizado_em: string
  fotos_imovel?: LinhaFoto[] | null
}

export interface LinhaConfiguracao {
  id: number
  numero_whatsapp: string | null
  nome_exibido: string | null
}
