import { copyFileSync, existsSync, writeFileSync } from 'node:fs'

const pastaPublica = '.output/public'
const arquivoIndice = `${pastaPublica}/index.html`

if (!existsSync(arquivoIndice)) {
  console.error('index.html nao encontrado em .output/public')
  process.exit(1)
}

copyFileSync(arquivoIndice, `${pastaPublica}/404.html`)
writeFileSync(`${pastaPublica}/.nojekyll`, '')
console.log('Fallback de SPA pronto: 404.html e .nojekyll')
