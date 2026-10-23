import type { Configuracao } from '~/tipos/imovel'

let buscaAtual: Promise<void> | null = null

export function useConfiguracaoPublica() {
  const { getConfiguracao } = useImoveis()
  const { configurado } = useClienteSupabase()
  const configuracao = useState<Configuracao>('configuracao-publica', () => ({
    id: 1,
    numeroWhatsapp: '',
    nomeExibido: 'Couto Imóveis',
  }))
  const carregada = useState('configuracao-carregada', () => false)

  async function carregarConfiguracao(forcar = false) {
    if (forcar) {
      carregada.value = false
      buscaAtual = null
    }
    if (carregada.value) return configuracao.value
    if (!buscaAtual) {
      buscaAtual = (async () => {
        try {
          if (!configurado.value) return
          const atual = await getConfiguracao()
          if (atual) configuracao.value = atual
        }
        catch {
          // O nome padrão continua visível se a tabela ainda não existir.
        }
        finally {
          carregada.value = true
        }
      })()
    }
    await buscaAtual
    return configuracao.value
  }

  function setConfiguracao(valor: Configuracao) {
    configuracao.value = valor
    carregada.value = true
  }

  return { configuracao, carregarConfiguracao, setConfiguracao }
}
