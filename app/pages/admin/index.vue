<script setup lang="ts">
import type { Imovel } from '~/tipos/imovel'

definePageMeta({
  layout: 'painel',
  middleware: 'painel',
})

useHead({ title: 'Painel · Couto Imóveis' })

const { configurado } = useClienteSupabase()
const { getImoveis, excluirImovel } = useImoveis()
const listaImoveis = ref<Imovel[]>([])
const carregando = ref(true)
const erro = ref('')
const imovelParaExcluir = ref<Imovel | null>(null)
const excluindo = ref(false)

async function carregarPainel() {
  if (!configurado.value) {
    carregando.value = false
    return
  }
  carregando.value = true
  erro.value = ''
  try {
    listaImoveis.value = await getImoveis()
  }
  catch (erroCapturado) {
    erro.value = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível listar os imóveis.'
  }
  finally {
    carregando.value = false
  }
}

async function confirmarExclusao() {
  const imovel = imovelParaExcluir.value
  imovelParaExcluir.value = null
  if (!imovel) return
  excluindo.value = true
  try {
    await excluirImovel(imovel)
    listaImoveis.value = listaImoveis.value.filter((anuncio) => anuncio.id !== imovel.id)
  }
  catch (erroCapturado) {
    erro.value = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível excluir.'
  }
  finally {
    excluindo.value = false
  }
}

onMounted(carregarPainel)
</script>

<template>
  <AvisoSupabase v-if="!configurado" />
  <div v-else class="mx-auto w-full max-w-4xl px-4 py-8">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-4xl text-floresta-900">Imóveis</h1>
        <p class="mt-1 text-apagado">Rascunhos ficam só aqui. Ativos e vendidos aparecem no site.</p>
      </div>
      <NuxtLink to="/admin/imoveis/novo" class="inline-flex min-h-12 items-center rounded-full bg-floresta-800 px-5 font-medium text-areia-50">
        Novo imóvel
      </NuxtLink>
    </div>
    <p v-if="carregando" class="mt-8 text-apagado">Carregando…</p>
    <p v-else-if="erro" class="mt-8 text-terracota-700" role="alert">{{ erro }}</p>
    <div v-else-if="!listaImoveis.length" class="mt-8 rounded-[1.75rem] border border-dashed border-linha bg-papel px-6 py-12 text-center">
      <p class="font-serif text-3xl text-floresta-900">Nenhum imóvel cadastrado</p>
      <p class="mt-2 text-apagado">Comece pelo primeiro anúncio.</p>
    </div>
    <ul v-else class="mt-6 space-y-3">
      <li v-for="imovel in listaImoveis" :key="imovel.id" class="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-papel p-4 ring-1 ring-linha">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-2xl text-floresta-900">{{ imovel.titulo }}</h2>
            <SeloStatus :status="imovel.status" />
          </div>
          <p class="text-apagado">{{ rotuloTipo(imovel.tipo) }} · {{ imovel.bairro }} · {{ formatarPreco(imovel.precoCentavos) }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <NuxtLink :to="`/admin/imoveis/${imovel.id}`" class="inline-flex min-h-11 items-center rounded-full border border-floresta-800 px-4 text-floresta-800">
            Editar
          </NuxtLink>
          <button type="button" class="inline-flex min-h-11 items-center rounded-full border border-terracota-600 px-4 text-terracota-700" :disabled="excluindo" @click="imovelParaExcluir = imovel">
            Excluir
          </button>
        </div>
      </li>
    </ul>
    <ConfirmarExclusao
      :aberto="Boolean(imovelParaExcluir)"
      titulo="Excluir este imóvel?"
      :mensagem="imovelParaExcluir ? `${imovelParaExcluir.titulo} sai do catálogo, junto com as fotos.` : ''"
      @cancelar="imovelParaExcluir = null"
      @confirmar="confirmarExclusao"
    />
  </div>
</template>
