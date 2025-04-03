import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default {
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: "all"
  },
   build: {
    rollupOptions: {
      preserveEntrySignatures: 'allow-extension',
    },
  }
};

