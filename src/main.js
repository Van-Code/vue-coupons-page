import Vue from 'vue';
import myApp from '@/App.vue';
import router from '@/router';
import vuetify from '@/plugins/vuetify';
import { store } from '@/store';
import '@/assets/styles/globals.scss';

new Vue({
	el: '.app',
	router,
	store,
	vuetify,
	render: (h) => h(myApp, {})
}).$mount('#app');
