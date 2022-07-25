import Vue from 'vue'
import 'highlight.js/styles/dracula.css';
import router from './router'
import App from './app';
import Hightlightjs from './components/highlightjs';
import CodePanel from './components/code-panel';
Vue.component('code-panel', CodePanel);
Vue.component('highlightjs', Hightlightjs);


import '../dist/style/icon/iconfont.css'
import '../dist/style/theme/dark/index.css'
const ctx = require.context('../dist/lib', false, /\.js$/);
ctx.keys().forEach(key => {
    //if(key.indexOf('custom-table') !== -1) return;
    Vue.use(ctx(key).default)
});

/*import CustomTable from '../src/packages/custom-table/index';
Vue.use(CustomTable);*/
import {vTransferDom} from "../dist/directives/v-transfer-dom";
import {vResize} from "../dist/directives/v-resize";
import {vLoading} from "../dist/directives/v-loading";
import {vMouseWheel} from "../dist/directives/v-mousewheel";
import {vClickOutside} from "../dist/directives/v-click-outside";
Vue.use(vTransferDom);
Vue.use(vResize);
Vue.use(vLoading);
Vue.use(vMouseWheel);
Vue.use(vClickOutside);


new Vue({
    el: '#app',
    router,
    render: (h) => h(App)
})

window.onerror = e => console.log(e);
