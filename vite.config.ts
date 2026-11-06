import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const { VITE_SUPABASE_PUBLISHABLE_KEY: key } = loadEnv(mode, process.cwd())
  if (key && !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
    throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY must be a Supabase publishable key.')
  }

  return {
    plugins: [
      figmaAssetResolver(),
      // Both plugins are required by the original Figma Make project.
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
