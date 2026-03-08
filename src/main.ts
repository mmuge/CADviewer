import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Load cad-viewer CSS directly from node_modules path (bypasses exports field restriction)
import '../node_modules/@mlightcad/cad-viewer/dist/index.css'

createApp(App)
  .use(ElementPlus)
  .mount('#app')
