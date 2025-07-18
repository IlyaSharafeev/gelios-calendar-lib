import { createApp } from 'vue'
import './assets/main.css'
import '@vuepic/vue-datepicker/dist/main.css'
import 'vue-final-modal/style.css'
import { createVfm } from 'vue-final-modal'
import App from './App.vue'
import i18n from '/i18n'
import router from './router'
const vfm = createVfm()


const app = createApp(App)

app.use(router)
app.use(vfm)
app.use(i18n)

app.mount('#app')
