<script setup lang="ts">
import type { Imovel } from '~/tipos/imovel'

const rota = useRoute()
const { configurado, cliente } = useClienteSupabase()
const { getImovel } = useImoveis()
const { configuracao, carregarConfiguracao } = useConfiguracaoPublica()
const { getUrlAbsoluta } = useUrlPublica()
const { usuarioEmail, carregarSessao } = useSessao()

const idImovel = computed(() => String(rota.params.id || ''))
const imovelSelecionado = ref<Imovel | null>(null)
const carregando = ref(true)
const erro = ref('')

const capaAtual = computed(() => imovelSelecionado.value ? getCapa(imovelSelecionado.value.fotos) : null)
const urlCapa = computed(() => {
  if (!cliente || !capaAtual.value) return null
  return getUrlFoto(cliente, capaAtual.value.caminho)
})
const urlPagina = computed(() => getUrlAbsoluta(`/imovel/${idImovel.value}`))
const itensGaleria = computed(() => {
  const imovel = imovelSelecionado.value
  if (!cliente || !imovel) return []
  return imovel.fotos.map((foto, indice) => ({
    id: foto.id,
    url: getUrlFoto(cliente, foto.caminho),
    alt: `${imovel.titulo} — foto ${indice + 1}`,
  }))
})

useHead({ title: computed(() => imovelSelecionado.value?.titulo || 'Imóvel') })

async function carregarImovel() {
  if (!configurado.value) {
    carregando.value = false
    return
  }
  carregando.value = true
  erro.value = ''
  try {
    await carregarConfiguracao()
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

onMounted(() => {
  carregarSessao()
  carregarImovel()
})
watch(idImovel, carregarImovel)
</script>

<template>
  <AvisoSupabase v-if="!configurado" />
  <div v-else class="mx-auto w-full max-w-6xl px-4 py-6 pb-40 md:pb-10">
    <NuxtLink to="/" class="inline-flex min-h-11 items-center text-sm text-floresta-800">← Catálogo</NuxtLink>
    <p v-if="carregando" class="mt-8 text-apagado">Carregando imóvel…</p>
    <div v-else-if="erro" class="mt-8 max-w-xl rounded-3xl bg-papel p-5 ring-1 ring-linha" role="alert">
      <p>{{ erro }}</p>
      <button type="button" class="mt-4 inline-flex min-h-11 items-center rounded-full bg-floresta-800 px-4 text-areia-50" @click="carregarImovel">
        Tentar de novo
      </button>
    </div>
    <article v-else-if="imovelSelecionado" class="mt-4">
      <GaleriaFotos :itens="itensGaleria" :titulo="imovelSelecionado.titulo" />
      <div class="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div class="flex flex-wrap items-center gap-3">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-apagado">{{ rotuloTipo(imovelSelecionado.tipo) }}</p>
            <SeloStatus v-if="imovelSelecionado.status !== 'ativo'" :status="imovelSelecionado.status" />
          </div>
          <h1 class="mt-2 max-w-3xl font-serif text-3xl leading-[1.08] text-floresta-900 sm:text-5xl">{{ imovelSelecionado.titulo }}</h1>
          <p class="mt-2 text-lg text-apagado">{{ imovelSelecionado.bairro }} · {{ imovelSelecionado.cidade }}</p>
        </div>
        <p class="font-serif text-4xl text-terracota-700">{{ formatarPreco(imovelSelecionado.precoCentavos) }}</p>
      </div>
      <p v-if="imovelSelecionado.status === 'rascunho'" class="mt-3 text-sm text-apagado">
        Rascunho: este anúncio não aparece no catálogo público.
      </p>
      <p v-else-if="imovelSelecionado.status === 'vendido'" class="mt-3 text-sm text-apagado">
        Este imóvel já foi vendido.
      </p>
      <dl class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="rounded-2xl bg-papel p-3 ring-1 ring-linha">
          <dt class="text-sm text-apagado">Quartos</dt>
          <dd class="text-2xl text-floresta-900">{{ imovelSelecionado.quartos }}</dd>
        </div>
        <div class="rounded-2xl bg-papel p-3 ring-1 ring-linha">
          <dt class="text-sm text-apagado">Banheiros</dt>
          <dd class="text-2xl text-floresta-900">{{ imovelSelecionado.banheiros }}</dd>
        </div>
        <div class="rounded-2xl bg-papel p-3 ring-1 ring-linha">
          <dt class="text-sm text-apagado">Vagas</dt>
          <dd class="text-2xl text-floresta-900">{{ imovelSelecionado.vagas }}</dd>
        </div>
        <div class="rounded-2xl bg-papel p-3 ring-1 ring-linha">
          <dt class="text-sm text-apagado">Área</dt>
          <dd class="text-2xl text-floresta-900">{{ formatarArea(imovelSelecionado.areaM2) }} m²</dd>
        </div>
      </dl>
      <h2 class="mt-8 text-2xl text-floresta-900">Descrição</h2>
      <p class="mt-2 whitespace-pre-line text-lg leading-relaxed">{{ imovelSelecionado.descricao || 'O anunciante ainda não escreveu a descrição.' }}</p>
      <NuxtLink v-if="usuarioEmail" :to="`/admin/imoveis/${imovelSelecionado.id}`" class="mt-6 inline-flex min-h-11 items-center text-floresta-800 underline">
        Editar no painel
      </NuxtLink>
      <div class="fixed inset-x-0 bottom-0 z-30 border-t border-linha bg-papel/95 p-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0">
        <div class="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:flex-row">
          <BotaoFalarWhatsapp
            :imovel="imovelSelecionado"
            :numero-whatsapp="configuracao.numeroWhatsapp"
            :url-pagina="urlPagina"
          />
          <BotaoCompartilharWhatsapp
            :imovel="imovelSelecionado"
            :url-capa="urlCapa"
            :url-pagina="urlPagina"
          />
        </div>
      </div>
    </article>
  </div>
</template>
