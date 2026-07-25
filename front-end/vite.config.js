import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import commonjs from 'vite-plugin-commonjs'

export default defineConfig({
  plugins: [
    vue(),
    commonjs()
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  server: {
    host: '0.0.0.0',
    port: 3000,
    // Explicitly allow your multi-tenant domains to clear the security block
    allowedHosts: [
      'alphapms.com',
      'admin.alphapms.com',
      'client.alphapms.com'
    ]
  },

  preview: {
    host: '0.0.0.0',
    port: 3000
  },

  optimizeDeps: {
    include: ['rtcpeerconnection-shim', 'sdp']
  },

  assetsInclude: ['**/*.PNG', '**/*.JPG', '**/*.jpeg', '**/*.gif', '**/*.svg']
})