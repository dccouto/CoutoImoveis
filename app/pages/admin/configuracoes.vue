<script lang="ts">
import { setConfiguracao } from '~/estado/configuracaoPublica'
import { getConfiguracao, salvarConfiguracao } from '~/servicos/imoveis'
import { validarNumeroWhatsapp } from '~/utils/whatsapp'

export default {
  data() {
    return {
      numeroWhatsapp: '',
      nomeExibido: 'Couto Imóveis',
      exibirVendidos: true,
      carregando: true,
      salvando: false,
      erro: '',
      aviso: '',
      semLinha: false,
      configurado: false,
    }
  },
  created() {
    useHead({ title: 'Configurações · Couto Imóveis' })
    this.configurado = Boolean(this.$supabase)
  },
  mounted() {
    this.carregar()
  },
  methods: {
    async carregar() {
      this.carregando = true
      this.erro = ''
      try {
        const atual = await getConfiguracao(this.$supabase)
        if (!atual) {
          this.semLinha = true
          return
        }
        this.numeroWhatsapp = atual.numeroWhatsapp
        this.nomeExibido = atual.nomeExibido
        this.exibirVendidos = atual.exibirVendidos
        setConfiguracao(atual)
      }
      catch (erroCapturado) {
        this.erro = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível carregar a configuração.'
      }
      finally {
        this.carregando = false
      }
    },
    async aoSalvar() {
      this.aviso = ''
      this.erro = ''
      const mensagemNumero = validarNumeroWhatsapp(this.numeroWhatsapp)
      if (mensagemNumero) {
        this.erro = mensagemNumero
        return
      }
      this.salvando = true
      try {
        const salva = await salvarConfiguracao(
          this.$supabase,
          this.numeroWhatsapp,
          this.nomeExibido,
          this.exibirVendidos,
        )
        this.numeroWhatsapp = salva.numeroWhatsapp
        this.nomeExibido = salva.nomeExibido
        this.exibirVendidos = salva.exibirVendidos
        setConfiguracao(salva)
        this.aviso = 'Configuração salva. O site público já usa esses valores.'
      }
      catch (erroCapturado) {
        this.erro = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível salvar.'
      }
      finally {
        this.salvando = false
      }
    },
  },
}
</script>

<template>
  <AvisoSupabase v-if="!configurado" />
  <section v-else class="mx-auto w-full max-w-xl px-4 py-8">
    <h1 class="text-4xl text-floresta-900">Configurações</h1>
    <p class="mt-2 text-apagado">WhatsApp, nome exibido e o que aparece na página inicial.</p>
    <p v-if="carregando" class="mt-6 text-apagado">Carregando…</p>
    <p v-else-if="semLinha" class="mt-6 text-terracota-700" role="alert">
      A configuração ainda não existe. Cole a migração SQL no SQL Editor do Supabase.
    </p>
    <form v-else class="mt-6 space-y-4" @submit.prevent="aoSalvar">
      <div>
        <label class="mb-1 block text-sm font-medium" for="nome-exibido">Nome exibido</label>
        <input id="nome-exibido" v-model="nomeExibido" class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3" autocomplete="organization">
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium" for="numero-whatsapp">Número de WhatsApp</label>
        <input id="numero-whatsapp" v-model="numeroWhatsapp" inputmode="tel" placeholder="11999998888" class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3" autocomplete="tel">
        <p class="mt-1 text-sm text-apagado">DDD e número. Se você não digitar 55, o site acrescenta o código do Brasil.</p>
      </div>
      <div class="rounded-2xl bg-papel p-4 ring-1 ring-linha">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <label class="block text-sm font-medium text-floresta-900" for="exibir-vendidos">Exibir vendidos</label>
            <p class="mt-1 text-sm text-apagado">
              Mostra a seção de imóveis vendidos na página inicial pública.
            </p>
          </div>
          <button
            id="exibir-vendidos"
            type="button"
            role="switch"
            class="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition"
            :class="exibirVendidos ? 'bg-floresta-800' : 'bg-areia-100 ring-1 ring-linha'"
            :aria-checked="exibirVendidos"
            :aria-label="exibirVendidos ? 'Exibir vendidos ligado' : 'Exibir vendidos desligado'"
            @click="exibirVendidos = !exibirVendidos"
          >
            <span
              class="inline-block h-6 w-6 rounded-full bg-papel shadow transition"
              :class="exibirVendidos ? 'translate-x-7' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>
      <p v-if="erro" class="text-sm text-terracota-700" role="alert">{{ erro }}</p>
      <p v-if="aviso" class="text-sm text-floresta-800" role="status">{{ aviso }}</p>
      <button type="submit" class="inline-flex min-h-12 items-center rounded-full bg-floresta-800 px-6 font-medium text-areia-50 disabled:opacity-60" :disabled="salvando">
        {{ salvando ? 'Salvando…' : 'Salvar configuração' }}
      </button>
    </form>
  </section>
</template>
