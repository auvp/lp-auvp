import { defineConfig } from 'vite'
import { partytownVite } from '@qwik.dev/partytown/utils'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'node:fs'
import { preencherTurma } from '../scripts/lib/turma.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const basePath = process.env.BASE_PATH || '/'
const outDir = process.env.BUILD_OUT_DIR || 'docs'

export default defineConfig({
  base: basePath,
  build: {
    outDir,
    // Prevent deleting the static export when publishing outside this project.
    emptyOutDir: false,
  },
  plugins: [
    {
      name: 'dados-de-turma',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          const dados = JSON.parse(readFileSync(new URL('../dados/turma.json', import.meta.url), 'utf8'))
          return preencherTurma(html, dados)
        },
      },
    },
    partytownVite({
      dest: path.resolve(__dirname, outDir, '~partytown'),
    }),
  ],
})
