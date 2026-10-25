import { reactive } from 'vue'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Configuracao } from '~/tipos/imovel'
import { getConfiguracao } from '~/servicos/imoveis'

export const estadoConfiguracao = reactive({
  id: 1,
  numeroWhatsapp: '',
  nomeExibido: 'Couto Imóveis',
  carregada: false,
})

let buscaAtual: Promise<void> | null = null

export function setConfiguracao(valor: Configuracao) {
  estadoConfiguracao.id = valor.id
  estadoConfiguracao.numeroWhatsapp = valor.numeroWhatsapp
  estadoConfiguracao.nomeExibido = valor.nomeExibido
  estadoConfiguracao.carregada = true
}

export async function carregarConfiguracao(cliente: SupabaseClient | null, forcar = false) {
  if (forcar) {
    estadoConfiguracao.carregada = false
    buscaAtual = null
  }
  if (estadoConfiguracao.carregada) return estadoConfiguracao
  if (!buscaAtual) {
    buscaAtual = (async () => {
      try {
        if (!cliente) return
        const atual = await getConfiguracao(cliente)
        if (atual) setConfiguracao(atual)
      }
      catch {
        // O nome padrão continua visível se a tabela ainda não existir.
      }
      finally {
        estadoConfiguracao.carregada = true
      }
    })()
  }
  await buscaAtual
  return estadoConfiguracao
}
