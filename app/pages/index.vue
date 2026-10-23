<script setup lang="ts">
import type { FiltroTipo, Imovel } from '~/tipos/imovel'

useHead({ title: 'Couto Imóveis' })

const catalogo = useCatalogo()
const { configurado } = useClienteSupabase()
const { getImoveis } = useImoveis()

const listaImoveis = ref<Imovel[]>([])
const listaVendidos = ref<Imovel[]>([])
const carregando = ref(true)
const erro = ref('')

const opcoesFiltro: Array<{ valor: FiltroTipo, rotulo: string }> = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'casa', rotulo: 'Casas' },
  { valor: 'apartamento', rotulo: 'Apartamentos' },
]

const ativosVisiveis = computed(() => filterPorTipo(listaImoveis.value, catalogo.filtroTipo))
const vendidosVisiveis = computed(() => filterPorTipo(listaVendidos.value, catalogo.filtroTipo))

async function carregarCatalogo() {
  if (!configurado.value) {
    carregando.value = false
    return
  }
  carregando.value = true
  erro.value = ''
  try {
    const [ativos, vendidos] = await Promise.all([
      getImoveis('ativo'),
      getImoveis('vendido'),
    ])
    listaImoveis.value = ativos
    listaVendidos.value = vendidos
  }
  catch (erroCapturado) {
    erro.value = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível carregar o catálogo.'
  }
  finally {
    carregando.value = false
  }
}

onMounted(carregarCatalogo)
</script>

<template>
  <AvisoSupabase v-if="!configurado" />
  <div v-else class="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-terracota-700">À venda</p>
    <h1 class="mt-3 max-w-3xl font-serif text-3xl leading-[1.08] text-floresta-900 sm:text-5xl lg:text-6xl">
      Casas e apartamentos com foto, preço e endereço.
    </h1>
    <div class="mt-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Filtrar por tipo">
      <button
        v-for="opcao in opcoesFiltro"
        :key="opcao.valor"
        type="button"
        role="radio"
        class="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium"
        :class="catalogo.filtroTipo === opcao.valor ? 'bg-floresta-800 text-areia-50' : 'bg-papel text-floresta-800 ring-1 ring-linha'"
        :aria-checked="catalogo.filtroTipo === opcao.valor"
        @click="catalogo.setFiltroTipo(opcao.valor)"
      >
        {{ opcao.rotulo }}
      </button>
    </div>

    <p v-if="carregando" class="mt-10 text-apagado">Carregando imóveis…</p>
    <div v-else-if="erro" class="mt-10 max-w-xl rounded-3xl bg-papel p-5 ring-1 ring-linha" role="alert">
      <p>{{ erro }}</p>
      <button type="button" class="mt-4 inline-flex min-h-11 items-center rounded-full bg-floresta-800 px-4 text-areia-50" @click="carregarCatalogo">
        Tentar de novo
      </button>
    </div>
    <template v-else>
      <div v-if="!ativosVisiveis.length" class="mt-10 w-full min-w-0 rounded-[1.75rem] border border-dashed border-linha bg-papel px-5 py-12 text-center sm:px-6 sm:py-14">
        <p class="font-serif text-2xl text-floresta-900 sm:text-3xl">Nenhum imóvel neste filtro</p>
        <p class="mx-auto mt-2 max-w-md text-apagado">Quando houver um anúncio ativo, a foto e o preço aparecem aqui.</p>
      </div>
      <ul v-else class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="imovel in ativosVisiveis" :key="imovel.id">
          <CartaoImovel :imovel="imovel" />
        </li>
      </ul>

      <section v-if="vendidosVisiveis.length" class="mt-16" aria-labelledby="titulo-vendidos">
        <h2 id="titulo-vendidos" class="text-3xl text-apagado">Vendidos</h2>
        <p class="mt-1 text-sm text-apagado">Imóveis que já saíram do catálogo ativo.</p>
        <ul class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="imovel in vendidosVisiveis" :key="imovel.id">
            <CartaoImovel :imovel="imovel" />
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
