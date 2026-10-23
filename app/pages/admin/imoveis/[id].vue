<script setup lang="ts">
import type { DadosImovel, Imovel } from '~/tipos/imovel'

definePageMeta({
  layout: 'painel',
  middleware: 'painel',
})

const rota = useRoute()
const roteador = useRouter()
const { configurado, cliente } = useClienteSupabase()
const { getImovel, salvarImovel, excluirImovel } = useImoveis()
const { getUrlAbsoluta } = useUrlPublica()

const idImovel = computed(() => String(rota.params.id || ''))
const imovelSelecionado = ref<Imovel | null>(null)
const carregando = ref(true)
const salvando = ref(false)
const erro = ref('')
const confirmarAberto = ref(false)

const capaAtual = computed(() => imovelSelecionado.value ? getCapa(imovelSelecionado.value.fotos) : null)
const urlCapa = computed(() => {
  if (!cliente || !capaAtual.value) return null
  return getUrlFoto(cliente, capaAtual.value.caminho)
})
const urlPagina = computed(() => getUrlAbsoluta(`/imovel/${idImovel.value}`))

useHead({ title: computed(() => imovelSelecionado.value ? `Editar ${imovelSelecionado.value.titulo}` : 'Editar imóvel') })

async function carregarEdicao() {
  carregando.value = true
  erro.value = ''
  try {
    imovelSelecionado.value = await getImovel(idImovel.value)
    if (!imovelSelecionado.value) erro.value = 'Imóvel não encontrado.'
  }
  catch (erroCapturado) {
    erro.value = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível abrir o imóvel.'
  }
  finally {
    carregando.value = false
  }
}

async function aoSalvar(dados: DadosImovel) {
  if (!imovelSelecionado.value) return
  salvando.value = true
  erro.value = ''
  try {
    imovelSelecionado.value = await salvarImovel(dados, imovelSelecionado.value.id)
  }
  catch (erroCapturado) {
    erro.value = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível salvar.'
  }
  finally {
    salvando.value = false
  }
}

async function confirmarExclusao() {
  if (!imovelSelecionado.value) return
  confirmarAberto.value = false
  try {
    await excluirImovel(imovelSelecionado.value)
    await roteador.replace('/admin')
  }
  catch (erroCapturado) {
    erro.value = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível excluir.'
  }
}

onMounted(carregarEdicao)
</script>

<template>
  <AvisoSupabase v-if="!configurado" />
  <div v-else class="mx-auto w-full max-w-3xl px-4 py-8">
    <NuxtLink to="/admin" class="inline-flex min-h-11 items-center text-sm text-floresta-800">← Imóveis</NuxtLink>
    <p v-if="carregando" class="mt-6 text-apagado">Carregando…</p>
    <p v-else-if="erro && !imovelSelecionado" class="mt-6 text-terracota-700" role="alert">{{ erro }}</p>
    <template v-else-if="imovelSelecionado">
      <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-4xl text-floresta-900">Editar imóvel</h1>
        <NuxtLink :to="`/imovel/${imovelSelecionado.id}`" class="inline-flex min-h-11 items-center text-floresta-800 underline">
          Ver página
        </NuxtLink>
      </div>
      <p v-if="imovelSelecionado.status !== 'ativo'" class="mt-2 text-sm text-apagado">
        Só anúncios ativos aparecem no catálogo. Rascunho não abre para quem não está logado.
      </p>
      <p v-if="erro" class="mt-4 text-terracota-700" role="alert">{{ erro }}</p>
      <div class="mt-6 space-y-8">
        <FormularioImovel :key="imovelSelecionado.atualizadoEm" :imovel-inicial="imovelSelecionado" :salvando="salvando" rotulo-salvar="Salvar alterações" @salvar="aoSalvar" />
        <GerenciadorFotos :imovel-id="imovelSelecionado.id" :fotos="imovelSelecionado.fotos" @atualizado="carregarEdicao" />
        <BotaoCompartilharWhatsapp :imovel="imovelSelecionado" :url-capa="urlCapa" :url-pagina="urlPagina" />
        <button type="button" class="inline-flex min-h-12 items-center rounded-full border border-terracota-600 px-5 text-terracota-700" @click="confirmarAberto = true">
          Excluir imóvel
        </button>
      </div>
      <ConfirmarExclusao
        :aberto="confirmarAberto"
        titulo="Excluir este imóvel?"
        :mensagem="`${imovelSelecionado.titulo} sai do catálogo, junto com as fotos.`"
        @cancelar="confirmarAberto = false"
        @confirmar="confirmarExclusao"
      />
    </template>
  </div>
</template>
