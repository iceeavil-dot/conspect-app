import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // Принудительно используем ESM-версии tldraw
      tldraw: 'tldraw',
      '@tldraw/editor': '@tldraw/editor',
      '@tldraw/store': '@tldraw/store',
      '@tldraw/state': '@tldraw/state',
      '@tldraw/state-react': '@tldraw/state-react',
      '@tldraw/utils': '@tldraw/utils',
      '@tldraw/validate': '@tldraw/validate',
      '@tldraw/tlschema': '@tldraw/tlschema',
    },
  },
}

export default nextConfig