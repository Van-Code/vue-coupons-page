import Vue from 'vue';
//common modules
import myApp from '@/App.vue';
import router from '@/router';
import vuetify from '@/plugins/vuetify';
import { store } from '@/store';

new Vue({
	el: '.app',
	router,
	store,
	vuetify,
	render: (h) => h(myApp, {})
}).$mount('#app');
