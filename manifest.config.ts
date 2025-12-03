import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  description: pkg.description,
  version: pkg.version,
  icons: {
    128: 'public/logo.png',
  },
  action: {
    default_icon: 'public/logo.png',
    default_popup: 'src/popup/index.html',
    default_title: 'Persistent Annotator',
  },
  permissions: [
    'sidePanel',
    'contentSettings',
    'activeTab',
    'storage',
    'contextMenus',
    'tabs',
  ],
  background: {
    service_worker: 'src/background/service-worker.ts',
  },
  content_scripts: [
    {
      js: ['src/content/main.tsx'],
      matches: ['https://*/*'],
    },
  ],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
})
