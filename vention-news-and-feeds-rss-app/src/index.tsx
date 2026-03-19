/// <reference types="vite/client" />

import './index.css'

import { createRoot } from 'react-dom/client'
import { App } from './App'
import { configure } from '@telemetryos/sdk'

configure('telemetryos-rss-app')

createRoot(document.querySelector('#app')!).render(<App />)
