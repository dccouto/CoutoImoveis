<script setup lang="ts">
useHead({ title: 'Entrar · Couto Imóveis' })

const { configurado } = useClienteSupabase()
const { entrar, carregarSessao } = useSessao()
const roteador = useRouter()
const email = ref('')
const senha = ref('')
const enviando = ref(false)
const erro = ref('')

onMounted(async () => {
  const sessao = await carregarSessao()
  if (sessao) await roteador.replace('/admin')
})

async function aoEntrar() {
  erro.value = ''
  if (!email.value.trim() || !senha.value) {
    erro.value = 'Informe o e-mail e a senha.'
    return
  }
  enviando.value = true
  try {
    await entrar(email.value.trim(), senha.value)
    await roteador.replace('/admin')
  }
  catch (erroCapturado) {
    erro.value = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível entrar.'
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <AvisoSupabase v-if="!configurado" />
  <section v-else class="mx-auto w-full max-w-md px-4 py-12">
    <div class="rounded-[1.75rem] bg-papel p-6 ring-1 ring-linha sm:p-8">
    <h1 class="font-serif text-4xl text-floresta-900">Área do anunciante</h1>
    <p class="mt-2 text-apagado">Entre com o usuário criado em Authentication no Supabase.</p>
    <form class="mt-6 space-y-4" @submit.prevent="aoEntrar">
      <div>
        <label class="mb-1 block text-sm font-medium" for="email">E-mail</label>
        <input id="email" v-model="email" type="email" autocomplete="username" required class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3">
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium" for="senha">Senha</label>
        <input id="senha" v-model="senha" type="password" autocomplete="current-password" required class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3">
      </div>
      <p v-if="erro" class="text-sm text-terracota-700" role="alert">{{ erro }}</p>
      <button type="submit" class="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-floresta-800 font-semibold text-areia-50 disabled:opacity-60" :disabled="enviando">
        {{ enviando ? 'Entrando…' : 'Entrar' }}
      </button>
    </form>
    </div>
  </section>
</template>
