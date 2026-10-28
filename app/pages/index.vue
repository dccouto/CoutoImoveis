<script lang="ts">
import type { FiltroTipo, Imovel, OrdenacaoCatalogo } from '~/tipos/imovel'
import { mapActions, mapState } from 'pinia'
import { useCatalogo } from '~/stores/catalogo'
import { getImoveis } from '~/servicos/imoveis'
import { filterPorTipo } from '~/utils/filterPorTipo'
import { ordenarImoveis } from '~/utils/ordenarImoveis'

export default {
  data() {
    return {
      listaImoveis: [] as Imovel[],
      listaVendidos: [] as Imovel[],
      carregando: true,
      erro: '',
      configurado: false,
      ordenacao: 'preco_menor' as OrdenacaoCatalogo,
      opcoesFiltro: [
        { valor: 'todos', rotulo: 'Todos' },
        { valor: 'casa', rotulo: 'Casas' },
        { valor: 'apartamento', rotulo: 'Apartamentos' },
      ] as Array<{ valor: FiltroTipo, rotulo: string }>,
      opcoesOrdenacao: [
        { valor: 'preco_menor', rotulo: 'Preço: menor → maior' },
        { valor: 'preco_maior', rotulo: 'Preço: maior → menor' },
        { valor: 'tipo_casa', rotulo: 'Tipo: casa → apartamento' },
        { valor: 'tipo_apartamento', rotulo: 'Tipo: apartamento → casa' },
      ] as Array<{ valor: OrdenacaoCatalogo, rotulo: string }>,
    }
  },
  computed: {
    ...mapState(useCatalogo, ['filtroTipo']),
    ativosVisiveis(): Imovel[] {
      const filtrados = filterPorTipo(this.listaImoveis, this.filtroTipo)
      return ordenarImoveis(filtrados, this.ordenacao)
    },
    vendidosVisiveis(): Imovel[] {
      const filtrados = filterPorTipo(this.listaVendidos, this.filtroTipo)
      return ordenarImoveis(filtrados, this.ordenacao)
    },
  },
  created() {
    useHead({ title: 'Couto Imóveis' })
    this.configurado = Boolean(this.$supabase)
  },
  mounted() {
    this.carregarCatalogo()
  },
  methods: {
    ...mapActions(useCatalogo, ['setFiltroTipo']),
    async carregarCatalogo() {
      if (!this.configurado) {
        this.carregando = false
        return
      }
      this.carregando = true
      this.erro = ''
      try {
        const [ativos, vendidos] = await Promise.all([
          getImoveis(this.$supabase, 'ativo'),
          getImoveis(this.$supabase, 'vendido'),
        ])
        this.listaImoveis = ativos
        this.listaVendidos = vendidos
      }
      catch (erroCapturado) {
        this.erro = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível carregar o catálogo.'
      }
      finally {
        this.carregando = false
      }
    },
  },
}
</script>

<template>
  <AvisoSupabase v-if="!configurado" />
  <div v-else class="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-terracota-700">À venda</p>
    <h1 class="mt-3 max-w-3xl font-serif text-3xl leading-[1.08] text-floresta-900 sm:text-5xl lg:text-6xl">
      Casas e apartamentos com foto, preço e endereço.
    </h1>
    <div class="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Filtrar por tipo">
        <button
          v-for="opcao in opcoesFiltro"
          :key="opcao.valor"
          type="button"
          role="radio"
          class="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium"
          :class="filtroTipo === opcao.valor ? 'bg-floresta-800 text-areia-50' : 'bg-papel text-floresta-800 ring-1 ring-linha'"
          :aria-checked="filtroTipo === opcao.valor"
          @click="setFiltroTipo(opcao.valor)"
        >
          {{ opcao.rotulo }}
        </button>
      </div>
      <div class="flex w-full min-w-0 flex-col gap-1.5 sm:w-auto sm:min-w-[16rem]">
        <label for="ordenacao-catalogo" class="text-sm font-medium text-floresta-800">Ordenar por</label>
        <select
          id="ordenacao-catalogo"
          v-model="ordenacao"
          class="min-h-11 w-full rounded-2xl border border-linha bg-papel px-3 text-sm text-floresta-800"
        >
          <option v-for="opcao in opcoesOrdenacao" :key="opcao.valor" :value="opcao.valor">
            {{ opcao.rotulo }}
          </option>
        </select>
      </div>
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
