<script setup lang="ts">
import type { DadosImovel, FotoNova } from '~/tipos/imovel'

definePageMeta({
  layout: 'painel',
  middleware: 'painel',
})

useHead({ title: 'Novo imóvel · Couto Imóveis' })

const { configurado } = useClienteSupabase()
const { salvarImovel, enviarFotos } = useImoveis()
const roteador = useRouter()
const fotosNovas = ref<FotoNova[]>([])
const salvando = ref(false)
const erro = ref('')
const erroFotos = ref('')

function adicionarFotosNovas(evento: Event) {
  const entrada = evento.target as HTMLInputElement
  const arquivos = Array.from(entrada.files ?? [])
  entrada.value = ''
  const mensagens: string[] = []
  const aceitas: FotoNova[] = []
  for (const arquivo of arquivos) {
    const mensagem = validarFoto(arquivo)
    if (mensagem) {
      mensagens.push(mensagem)
      continue
    }
    aceitas.push({
      idLocal: crypto.randomUUID(),
      arquivo,
      previa: URL.createObjectURL(arquivo),
      capa: false,
    })
  }
  fotosNovas.value = [...fotosNovas.value, ...aceitas]
  if (fotosNovas.value.length && !fotosNovas.value.some((fotoNova) => fotoNova.capa)) {
    const primeira = fotosNovas.value[0]
    if (primeira) primeira.capa = true
  }
  erroFotos.value = mensagens[0] ?? ''
}

function setCapaNova(idLocal: string) {
  fotosNovas.value = fotosNovas.value.map((fotoNova) => ({
    ...fotoNova,
    capa: fotoNova.idLocal === idLocal,
  }))
}

function removerFotoNova(idLocal: string) {
  const foto = fotosNovas.value.find((fotoNova) => fotoNova.idLocal === idLocal)
  if (foto) URL.revokeObjectURL(foto.previa)
  fotosNovas.value = fotosNovas.value.filter((fotoNova) => fotoNova.idLocal !== idLocal)
  if (fotosNovas.value.length && !fotosNovas.value.some((fotoNova) => fotoNova.capa)) {
    const primeira = fotosNovas.value[0]
    if (primeira) primeira.capa = true
  }
}

async function aoSalvar(dados: DadosImovel) {
  salvando.value = true
  erro.value = ''
  try {
    const imovel = await salvarImovel(dados)
    if (fotosNovas.value.length) {
      await enviarFotos(
        imovel.id,
        fotosNovas.value.map((fotoNova) => ({ arquivo: fotoNova.arquivo, capa: fotoNova.capa })),
        0,
        true,
      )
    }
    await roteador.push(`/admin/imoveis/${imovel.id}`)
  }
  catch (erroCapturado) {
    erro.value = erroCapturado instanceof Error ? erroCapturado.message : 'Não foi possível salvar o imóvel.'
  }
  finally {
    salvando.value = false
  }
}

onBeforeUnmount(() => {
  for (const fotoNova of fotosNovas.value) URL.revokeObjectURL(fotoNova.previa)
})
</script>

<template>
  <AvisoSupabase v-if="!configurado" />
  <div v-else class="mx-auto w-full max-w-3xl px-4 py-8">
    <NuxtLink to="/admin" class="inline-flex min-h-11 items-center text-sm text-floresta-800">← Imóveis</NuxtLink>
    <h1 class="mt-2 text-4xl text-floresta-900">Novo imóvel</h1>
    <p v-if="erro" class="mt-4 text-terracota-700" role="alert">{{ erro }}</p>
    <div class="mt-6">
      <FormularioImovel :salvando="salvando" @salvar="aoSalvar">
        <section class="space-y-3 rounded-3xl bg-papel p-4 ring-1 ring-linha" aria-labelledby="titulo-fotos-novas">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 id="titulo-fotos-novas" class="text-2xl text-floresta-900">Fotos</h2>
            <label class="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-floresta-800 px-4 text-sm text-floresta-800">
              Escolher fotos
              <input class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple @change="adicionarFotosNovas">
            </label>
          </div>
          <p class="text-sm text-apagado">JPEG, PNG ou WebP, até 8 MB. Toque em “Capa” na foto principal.</p>
          <p v-if="erroFotos" class="text-sm text-terracota-700" role="alert">{{ erroFotos }}</p>
          <ul v-if="fotosNovas.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <li v-for="fotoNova in fotosNovas" :key="fotoNova.idLocal" class="space-y-2">
              <img :src="fotoNova.previa" alt="Prévia da foto escolhida" class="aspect-[4/3] w-full rounded-2xl object-cover">
              <div class="flex flex-wrap gap-2">
                <button type="button" class="inline-flex min-h-11 items-center rounded-full px-3 text-sm" :class="fotoNova.capa ? 'bg-floresta-800 text-areia-50' : 'border border-linha'" @click="setCapaNova(fotoNova.idLocal)">
                  {{ fotoNova.capa ? 'Capa' : 'Definir capa' }}
                </button>
                <button type="button" class="inline-flex min-h-11 items-center rounded-full border border-terracota-600 px-3 text-sm text-terracota-700" @click="removerFotoNova(fotoNova.idLocal)">
                  Remover
                </button>
              </div>
            </li>
          </ul>
        </section>
      </FormularioImovel>
    </div>
  </div>
</template>
