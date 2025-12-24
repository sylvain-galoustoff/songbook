import { registerSW } from 'virtual:pwa-register'

export const updateSW = registerSW({
  onNeedRefresh() {
    console.log('Nouvelle version disponible')
  },
  onOfflineReady() {
    console.log('Application prête pour le mode hors-ligne')
  }
})
