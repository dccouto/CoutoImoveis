<script lang="ts">
import type { Imovel, ItemGaleria } from '~/tipos/imovel'
import { carregarConfiguracao, estadoConfiguracao } from '~/estado/configuracaoPublica'
import { carregarSessao, estadoSessao } from '~/estado/sessao'
import { getImovel } from '~/servicos/imoveis'
import { getCapa, getUrlFoto } from '~/utils/fotos'

export default {
  data() {
    return {
      imovelSelecionado: null as Imovel | null,
      carregando: true,
      erro: '',
      configurado: false,
    }
  },
  computed: {
    idImovel(): string {
      return String(this.$route.params.id || '')
    },
    usuarioEmail(): string | null {
      return estadoSessao.usuarioEmail
    },
    numeroWhatsapp(): string {
      return estadoConfiguracao.numeroWhatsapp
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
    itensGaleria(): ItemGaleria[] {
      const imovel = this.imovelSelecionado
      if (!this.$supabase || !imovel) return []
      return imovel.fotos.map((foto, indice) => ({
        id: foto.id,
        url: getUrlFoto(this.$supabase, foto.caminho),
        alt: `${imovel.titulo} — foto ${indice + 1}`,
      }))
    },
  },
  watch: {
    idImovel(idNovo, idAntigo) {
      if (!idAntigo || idNovo === idAntigo) return
      this.carregarImovel()
    },
    imovelSelecionado() {
      this.definirTitulo()
    },
  },
  created() {
    this.configurado = Boolean(this.$supabase)
    this.definirTitulo()
  },
  mounted() {
    carregarSessao(this.$supabase)
    this.carregarImovel()
  },
  methods: {
    definirTitulo() {
      const titulo = this.imovelSelecionado?.titulo || 'Imóvel'
      useHead({ title: titulo })
      if (import.meta.client) document.title = titulo
    },
    async carregarImovel() {
      if (!this.configurado) {
        this.carregando = false
        return
      }
      this.carregando = true
      this.erro = ''
      try {
        await carregarConfiguracao(this.$supabase)
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
  },
}
</script>

<template>
  <AvisoSupabase v-if="!configurado" />
  <div v-else class="mx-auto w-full max-w-6xl px-4 py-6 pb-80 md:pb-10">
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
        <div class="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:flex-row sm:flex-wrap">
          <BotaoFalarWhatsapp
            :imovel="imovelSelecionado"
            :numero-whatsapp="numeroWhatsapp"
            :url-pagina="urlPagina"
          />
          <BotaoCompartilharWhatsapp
            :imovel="imovelSelecionado"
            :url-capa="urlCapa"
            :url-pagina="urlPagina"
          />
          <BotaoCompartilharFacebook
            :imovel="imovelSelecionado"
            :url-capa="urlCapa"
            :url-pagina="urlPagina"
          />
        </div>
      </div>
    </article>
  </div>
</template>
