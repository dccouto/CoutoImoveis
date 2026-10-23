<script setup lang="ts">
import type { DadosImovel, Imovel, StatusImovel, TipoImovel } from '~/tipos/imovel'

const propriedades = defineProps<{
  imovelInicial?: Imovel | null
  salvando?: boolean
  rotuloSalvar?: string
}>()

const emitir = defineEmits<{
  salvar: [dados: DadosImovel]
}>()

interface RascunhoFormulario {
  titulo: string
  tipo: TipoImovel
  status: StatusImovel
  precoReais: string
  descricao: string
  bairro: string
  cidade: string
  quartos: number
  banheiros: number
  vagas: number
  areaM2: number
}

function criarRascunho(imovel?: Imovel | null): RascunhoFormulario {
  if (!imovel) {
    return {
      titulo: '',
      tipo: 'apartamento',
      status: 'rascunho',
      precoReais: '',
      descricao: '',
      bairro: '',
      cidade: '',
      quartos: 0,
      banheiros: 0,
      vagas: 0,
      areaM2: 0,
    }
  }
  return {
    titulo: imovel.titulo,
    tipo: imovel.tipo,
    status: imovel.status,
    precoReais: formatarPrecoEntrada(imovel.precoCentavos),
    descricao: imovel.descricao,
    bairro: imovel.bairro,
    cidade: imovel.cidade,
    quartos: imovel.quartos,
    banheiros: imovel.banheiros,
    vagas: imovel.vagas,
    areaM2: imovel.areaM2,
  }
}

const rascunho = reactive(criarRascunho(propriedades.imovelInicial))
const erros = ref<Record<string, string>>({})

function inteiroValido(valor: number) {
  return Number.isFinite(valor) && valor >= 0 && Number.isInteger(valor)
}

function validarFormulario() {
  const encontrados: Record<string, string> = {}
  if (!rascunho.titulo.trim()) encontrados.titulo = 'Informe o título.'
  if (rascunho.tipo !== 'casa' && rascunho.tipo !== 'apartamento') encontrados.tipo = 'Escolha casa ou apartamento.'
  if (!['rascunho', 'ativo', 'vendido'].includes(rascunho.status)) encontrados.status = 'Escolha o status.'
  if (!rascunho.bairro.trim()) encontrados.bairro = 'Informe o bairro.'
  if (!rascunho.cidade.trim()) encontrados.cidade = 'Informe a cidade.'
  const precoCentavos = parsePrecoReais(rascunho.precoReais)
  if (precoCentavos === null) encontrados.precoReais = 'Informe um preço válido.'
  else if (precoCentavos <= 0) encontrados.precoReais = 'O preço precisa ser maior que zero.'
  if (!inteiroValido(Number(rascunho.quartos))) encontrados.quartos = 'Informe os quartos com um número inteiro.'
  if (!inteiroValido(Number(rascunho.banheiros))) encontrados.banheiros = 'Informe os banheiros com um número inteiro.'
  if (!inteiroValido(Number(rascunho.vagas))) encontrados.vagas = 'Informe as vagas com um número inteiro.'
  if (!Number.isFinite(Number(rascunho.areaM2)) || Number(rascunho.areaM2) < 0) encontrados.areaM2 = 'Informe a área em m².'
  return encontrados
}

function aoEnviar() {
  erros.value = validarFormulario()
  if (Object.keys(erros.value).length) return
  const precoCentavos = parsePrecoReais(rascunho.precoReais)
  if (precoCentavos === null) return
  emitir('salvar', {
    titulo: rascunho.titulo.trim(),
    tipo: rascunho.tipo,
    status: rascunho.status,
    precoCentavos,
    descricao: rascunho.descricao.trim(),
    bairro: rascunho.bairro.trim(),
    cidade: rascunho.cidade.trim(),
    quartos: Math.trunc(Number(rascunho.quartos)),
    banheiros: Math.trunc(Number(rascunho.banheiros)),
    vagas: Math.trunc(Number(rascunho.vagas)),
    areaM2: Number(rascunho.areaM2),
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="aoEnviar">
    <div>
      <label class="mb-1 block text-sm font-medium" for="titulo">Título</label>
      <input id="titulo" v-model="rascunho.titulo" required maxlength="140" class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3" autocomplete="off">
      <p v-if="erros.titulo" class="mt-1 text-sm text-terracota-700" role="alert">{{ erros.titulo }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1 block text-sm font-medium" for="tipo">Tipo</label>
        <select id="tipo" v-model="rascunho.tipo" class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3">
          <option value="apartamento">Apartamento</option>
          <option value="casa">Casa</option>
        </select>
        <p v-if="erros.tipo" class="mt-1 text-sm text-terracota-700" role="alert">{{ erros.tipo }}</p>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium" for="status">Status</label>
        <select id="status" v-model="rascunho.status" class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3">
          <option value="rascunho">Rascunho</option>
          <option value="ativo">Ativo</option>
          <option value="vendido">Vendido</option>
        </select>
        <p v-if="erros.status" class="mt-1 text-sm text-terracota-700" role="alert">{{ erros.status }}</p>
      </div>
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium" for="preco">Preço (R$)</label>
      <input id="preco" v-model="rascunho.precoReais" required inputmode="decimal" placeholder="450.000,00" class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3" autocomplete="off">
      <p v-if="erros.precoReais" class="mt-1 text-sm text-terracota-700" role="alert">{{ erros.precoReais }}</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1 block text-sm font-medium" for="bairro">Bairro</label>
        <input id="bairro" v-model="rascunho.bairro" required class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3" autocomplete="off">
        <p v-if="erros.bairro" class="mt-1 text-sm text-terracota-700" role="alert">{{ erros.bairro }}</p>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium" for="cidade">Cidade</label>
        <input id="cidade" v-model="rascunho.cidade" required class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3" autocomplete="off">
        <p v-if="erros.cidade" class="mt-1 text-sm text-terracota-700" role="alert">{{ erros.cidade }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div>
        <label class="mb-1 block text-sm font-medium" for="quartos">Quartos</label>
        <input id="quartos" v-model.number="rascunho.quartos" type="number" min="0" step="1" required class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3">
        <p v-if="erros.quartos" class="mt-1 text-sm text-terracota-700" role="alert">{{ erros.quartos }}</p>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium" for="banheiros">Banheiros</label>
        <input id="banheiros" v-model.number="rascunho.banheiros" type="number" min="0" step="1" required class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3">
        <p v-if="erros.banheiros" class="mt-1 text-sm text-terracota-700" role="alert">{{ erros.banheiros }}</p>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium" for="vagas">Vagas</label>
        <input id="vagas" v-model.number="rascunho.vagas" type="number" min="0" step="1" required class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3">
        <p v-if="erros.vagas" class="mt-1 text-sm text-terracota-700" role="alert">{{ erros.vagas }}</p>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium" for="area">Área (m²)</label>
        <input id="area" v-model.number="rascunho.areaM2" type="number" min="0" step="0.1" required class="min-h-12 w-full rounded-2xl border border-linha bg-papel px-3">
        <p v-if="erros.areaM2" class="mt-1 text-sm text-terracota-700" role="alert">{{ erros.areaM2 }}</p>
      </div>
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium" for="descricao">Descrição</label>
      <textarea id="descricao" v-model="rascunho.descricao" rows="6" class="w-full rounded-2xl border border-linha bg-papel px-3 py-3" />
    </div>

    <slot />

    <button type="submit" class="inline-flex min-h-12 items-center justify-center rounded-full bg-floresta-800 px-6 font-medium text-areia-50 disabled:opacity-60" :disabled="salvando">
      {{ salvando ? 'Salvando…' : (rotuloSalvar || 'Salvar imóvel') }}
    </button>
  </form>
</template>
