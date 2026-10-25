<script lang="ts">
import type { PropType } from 'vue'
import type { FotoImovel } from '~/tipos/imovel'
import { enviarFotos, excluirFoto, moverFoto, setCapa } from '~/servicos/imoveis'
import { getUrlFoto, validarFoto } from '~/utils/fotos'

export default {
  props: {
    imovelId: { type: String, required: true },
    fotos: { type: Array as PropType<FotoImovel[]>, required: true },
  },
  emits: ['atualizado'],
  data() {
    return {
      ocupado: false,
      erroFotos: '',
      fotoParaExcluir: null as FotoImovel | null,
    }
  },
  computed: {
    fotosOrdenadas(): FotoImovel[] {
      return [...this.fotos].sort((fotoA, fotoB) => fotoA.ordem - fotoB.ordem)
    },
  },
  methods: {
    urlDaFoto(caminho: string) {
      if (!this.$supabase) return ''
      return getUrlFoto(this.$supabase, caminho)
    },
    async executar(acao: () => Promise<void>) {
      this.ocupado = true
      this.erroFotos = ''
      try {
        await acao()
        this.$emit('atualizado')
      }
      catch (erroCapturado) {
        this.erroFotos = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível atualizar as fotos.'
      }
      finally {
        this.ocupado = false
      }
    },
    async adicionarFotos(evento: Event) {
      const entrada = evento.target as HTMLInputElement
      const arquivos = Array.from(entrada.files ?? [])
      entrada.value = ''
      if (!arquivos.length) return
      const mensagens = arquivos.map((arquivo) => validarFoto(arquivo)).filter((mensagem): mensagem is string => Boolean(mensagem))
      if (mensagens.length) {
        this.erroFotos = mensagens[0] ?? ''
        return
      }
      const maiorOrdem = this.fotosOrdenadas.reduce((maior, foto) => Math.max(maior, foto.ordem), -1)
      const jaTemCapa = this.fotosOrdenadas.some((foto) => foto.capa)
      await this.executar(() => enviarFotos(
        this.$supabase,
        this.imovelId,
        arquivos.map((arquivo) => ({ arquivo, capa: false })),
        maiorOrdem + 1,
        !jaTemCapa,
      ))
    },
    pedirExclusao(foto: FotoImovel) {
      this.fotoParaExcluir = foto
    },
    async confirmarExclusao() {
      const foto = this.fotoParaExcluir
      this.fotoParaExcluir = null
      if (!foto) return
      await this.executar(() => excluirFoto(this.$supabase, foto))
    },
    definirCapa(fotoId: string) {
      return this.executar(() => setCapa(this.$supabase, this.imovelId, fotoId))
    },
    mover(fotoId: string, direcao: 'subir' | 'descer') {
      return this.executar(() => moverFoto(this.$supabase, this.fotos, fotoId, direcao))
    },
  },
}
</script>

<template>
  <section class="space-y-3" aria-labelledby="titulo-fotos">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <h2 id="titulo-fotos" class="text-2xl text-floresta-900">Fotos</h2>
      <label class="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-floresta-800 px-4 text-sm font-medium text-floresta-800">
        Adicionar fotos
        <input class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple :disabled="ocupado" @change="adicionarFotos">
      </label>
    </div>
    <p class="text-sm text-apagado">JPEG, PNG ou WebP, até 8 MB cada. Uma delas fica como capa.</p>
    <p v-if="erroFotos" class="text-sm text-terracota-700" role="alert">{{ erroFotos }}</p>
    <ul v-if="fotosOrdenadas.length" class="space-y-3">
      <li v-for="(foto, indice) in fotosOrdenadas" :key="foto.id" class="flex gap-3 rounded-2xl bg-papel p-2 ring-1 ring-linha">
        <img :src="urlDaFoto(foto.caminho)" :alt="`Foto ${indice + 1}`" class="h-24 w-32 rounded-xl object-cover">
        <div class="flex flex-1 flex-col gap-2">
          <p v-if="foto.capa" class="text-xs font-medium uppercase tracking-wide text-terracota-700">Capa</p>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="inline-flex min-h-11 items-center rounded-full bg-floresta-800 px-3 text-sm text-areia-50 disabled:opacity-50" :disabled="ocupado || foto.capa" @click="definirCapa(foto.id)">
              Definir como capa
            </button>
            <button type="button" class="inline-flex min-h-11 items-center rounded-full border border-linha px-3 text-sm disabled:opacity-50" :disabled="ocupado || indice === 0" @click="mover(foto.id, 'subir')">
              Subir
            </button>
            <button type="button" class="inline-flex min-h-11 items-center rounded-full border border-linha px-3 text-sm disabled:opacity-50" :disabled="ocupado || indice === fotosOrdenadas.length - 1" @click="mover(foto.id, 'descer')">
              Descer
            </button>
            <button type="button" class="inline-flex min-h-11 items-center rounded-full border border-terracota-600 px-3 text-sm text-terracota-700 disabled:opacity-50" :disabled="ocupado" @click="pedirExclusao(foto)">
              Excluir foto
            </button>
          </div>
        </div>
      </li>
    </ul>
    <p v-else class="text-apagado">Nenhuma foto enviada.</p>
    <ConfirmarExclusao
      :aberto="Boolean(fotoParaExcluir)"
      titulo="Excluir esta foto?"
      mensagem="A imagem sai do anúncio e do armazenamento."
      @cancelar="fotoParaExcluir = null"
      @confirmar="confirmarExclusao"
    />
  </section>
</template>
