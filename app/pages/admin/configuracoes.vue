<script setup lang="ts">
definePageMeta({
  layout: 'painel',
  middleware: 'painel',
})

useHead({ title: 'WhatsApp · Couto Imóveis' })

const { configurado } = useClienteSupabase()
const { getConfiguracao, salvarConfiguracao } = useImoveis()
const { setConfiguracao } = useConfiguracaoPublica()

const numeroWhatsapp = ref('')
const nomeExibido = ref('Couto Imóveis')
const carregando = ref(true)
const salvando = ref(false)
const erro = ref('')
const aviso = ref('')
const semLinha = ref(false)

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const atual = await getConfiguracao()
    if (!atual) {
      semLinha.value = true
      return
    }
    numeroWhatsapp.value = atual.numeroWhatsapp
    nomeExibido.value = atual.nomeExibido
    setConfiguracao(atual)
  }
  catch (erroCapturado) {
    erro.value = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível carregar a configuração.'
  }
  finally {
    carregando.value = false
  }
}

async function aoSalvar() {
  aviso.value = ''
  erro.value = ''
  const mensagemNumero = validarNumeroWhatsapp(numeroWhatsapp.value)
  if (mensagemNumero) {
    erro.value = mensagemNumero
    return
  }
  salvando.value = true
  try {
    const salva = await salvarConfiguracao(numeroWhatsapp.value, nomeExibido.value)
    numeroWhatsapp.value = salva.numeroWhatsapp
    nomeExibido.value = salva.nomeExibido
    setConfiguracao(salva)
    aviso.value = 'WhatsApp salvo. Os anúncios já usam esse número.'
  }
  catch (erroCapturado) {
    erro.value = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível salvar.'
  }
  finally {
    salvando.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <AvisoSupabase v-if="!configurado" />
  <section v-else class="mx-auto w-full max-w-xl px-4 py-8">
    <h1 class="text-4xl text-floresta-900">WhatsApp</h1>
    <p class="mt-2 text-apagado">DDD e número. Se você não digitar 55, o site acrescenta o código do Brasil.</p>
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
      </div>
      <p v-if="erro" class="text-sm text-terracota-700" role="alert">{{ erro }}</p>
      <p v-if="aviso" class="text-sm text-floresta-800" role="status">{{ aviso }}</p>
      <button type="submit" class="inline-flex min-h-12 items-center rounded-full bg-floresta-800 px-6 font-medium text-areia-50 disabled:opacity-60" :disabled="salvando">
        {{ salvando ? 'Salvando…' : 'Salvar WhatsApp' }}
      </button>
    </form>
  </section>
</template>
