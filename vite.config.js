// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   build: {
//     rollupOptions: {
//       external: ['firebase/auth', 'firebase/firestore', 'firebase/app'],
//     },
//   },
// })


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     include: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
//   },
//   build: {
//     commonjsOptions: {
//       include: [/node_modules/]
//     }
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
        include: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
      },
      build: {
        commonjsOptions: {
          include: [/node_modules/]
        }
      }
})