import Vue from 'vue'
import 'highlight.js/styles/dracula.css';
import router from './router'
import '../src/assets/icon/iconfont.css'
import App from './app';
import CodePanel from './components/code-panel';
import Hightlightjs from './components/highlightjs';
Vue.component('code-panel', CodePanel);
Vue.component('highlightjs', Hightlightjs);

import CustomTable from '../dist/lib/custom-table';
import Dialog from '../dist/lib/custom-dialog';
import Scrollbar from '../dist/lib/custom-scrollbar';
Vue.use(CustomTable);
Vue.use(Dialog);
Vue.use(Scrollbar);
new Vue({
    el: '#app',
    router,
    render: (h) => h(App)
})

