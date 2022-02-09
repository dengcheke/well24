import Vue from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/dracula.css';
import router from './router'
import '../src/assets/icon/iconfont.css'
import App from './app';
import CustomTable from '../src/packages/table/src/table';
import CodePanel from './components/code-panel';
import Dialog from '../src/packages/custom-dialog';
import Scrollbar from '../src/packages/custom-scrollbar';

Vue.component(CustomTable.name, CustomTable);
Vue.component('code-panel', CodePanel);
Vue.component(Dialog.name, Dialog);
Vue.component(Scrollbar.name, Scrollbar)
new Vue({
    el: '#app',
    router,
    render: (h) => h(App)
})

