import Vue from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/dracula.css';
Vue.use(hljs.vuePlugin);
import App from './app';
import router from './router'
import '../src/assets/icon/iconfont.css'

import CustomTable from '../src/packages/table/src/table';
Vue.component(CustomTable.name, CustomTable);
import CodePanel from './components/code-panel';
Vue.component('code-panel',CodePanel);

import Scrollbar from '../src/packages/custom-scrollbar';
Vue.component(Scrollbar.name, Scrollbar)

import Dialog from '../src/packages/custom-dialog';
Vue.component(Dialog.name,Dialog);

new Vue({
    el:'#app',
    router,
    render:(h)=>h(App)
})

