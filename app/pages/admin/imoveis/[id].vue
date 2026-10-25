<script lang="ts">
import type { DadosImovel, Imovel } from '~/tipos/imovel'
import { excluirImovel, getImovel, salvarImovel } from '~/servicos/imoveis'
import { getCapa, getUrlFoto } from '~/utils/fotos'

export default {
  data() {
    return {
      imovelSelecionado: null as Imovel | null,
      carregando: true,
      salvando: false,
      erro: '',
      confirmarAberto: false,
      configurado: false,
    }
  },
  computed: {
    idImovel(): string {
      return String(this.$route.params.id || '')
    },
    capaAtual() {
      return this.imovelSelecionado ? getCapa(this.imovelSelecionado.fotos) : null
    },
    urlCapa(): string | null {
      if (!this.$supabase || !this.capaAtual) return null
      return getUrlFoto(this.$supabase, this.capaAtual.caminho)
    },
    urlPagina(): string {
      const href = this.$router.resolve(`/imovel/${this.idImovel}`).href
      if (!import.meta.client) return href
      return new URL(href, window.location.origin).href
    },
  },
  watch: {
    imovelSelecionado() {
      this.definirTitulo()
    },
  },
  created() {
    this.configurado = Boolean(this.$supabase)
    this.definirTitulo()
  },
  mounted() {
    this.carregarEdicao()
  },
  methods: {
    definirTitulo() {
      const titulo = this.imovelSelecionado ? `Editar ${this.imovelSelecionado.titulo}` : 'Editar imóvel'
      useHead({ title: titulo })
      if (import.meta.client) document.title = titulo
    },
    async carregarEdicao() {
      this.carregando = true
      this.erro = ''
      try {
        this.imovelSelecionado = await getImovel(this.$supabase, this.idImovel)
        if (!this.imovelSelecionado) this.erro = 'Imóvel não encontrado.'
      }
      catch (erroCapturado) {
        this.erro = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível abrir o imóvel.'
      }
      finally {
        this.carregando = false
      }
    },
    async aoSalvar(dados: DadosImovel) {
      if (!this.imovelSelecionado) return
      this.salvando = true
      this.erro = ''
      try {
        this.imovelSelecionado = await salvarImovel(this.$supabase, dados, this.imovelSelecionado.id)
      }
      catch (erroCapturado) {
        this.erro = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível salvar.'
      }
      finally {
        this.salvando = false
      }
    },
    async confirmarExclusao() {
      if (!this.imovelSelecionado) return
      this.confirmarAberto = false
      try {
        await excluirImovel(this.$supabase, this.imovelSelecionado)
        await this.$router.replace('/admin')
      }
      catch (erroCapturado) {
        this.erro = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível excluir.'
      }
    },
  },
}
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
        <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <BotaoCompartilharWhatsapp :imovel="imovelSelecionado" :url-capa="urlCapa" :url-pagina="urlPagina" />
          <BotaoCompartilharFacebook :imovel="imovelSelecionado" :url-capa="urlCapa" :url-pagina="urlPagina" />
        </div>
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
