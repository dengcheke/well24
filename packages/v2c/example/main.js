import Vue from 'vue'
import 'highlight.js/styles/dracula.css';
import router from './router'
import '../src/assets/icon/iconfont.css'
import App from './app';
import CodePanel from './components/code-panel';
import Hightlightjs from './components/highlightjs';
import CustomTable from '../src/packages/custom-table/index';
import Dialog from '../src/packages/custom-dialog';
import Scrollbar from '../src/packages/custom-scrollbar';

Vue.component('code-panel', CodePanel);
Vue.component('highlightjs', Hightlightjs);

Vue.use(CustomTable);
Vue.use(Dialog);
Vue.use(Scrollbar);
new Vue({
    el: '#app',
    router,
    render: (h) => h(App)
})

window.onerror = e => console.log(e);
