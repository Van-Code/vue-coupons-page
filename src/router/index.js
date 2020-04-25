import Vue from 'vue';
import VueRouter from 'vue-router';
import AppHome from '@/views/Home.vue';

Vue.use(VueRouter);

const routes = [
	{
		path: '/',
		component: AppHome,
		default: true,
		meta: {
			title: 'Home',
			type: 'home',
			scope: 'browse'
		},
		name: 'home'
	},
	{
		path: '/myredeemed',
		component: AppHome,
		meta: {
			title: 'Home',
			type: 'home',
			scope: 'redeemed'
		}
	},
	{
		path: '/myactive',
		component: AppHome,
		meta: {
			title: 'Home',
			type: 'home',
			scope: 'active'
		}
	},
	{
		path: '/myredeemed',
		component: AppHome,
		meta: {
			title: 'Home',
			type: 'home',
			scope: 'redeemed'
		}
	},
	{
		path: '/mychallenges',
		component: AppHome,
		meta: {
			title: 'Home',
			type: 'home',
			scope: 'challenges'
		}
	},
	{
		path: '/myawardsawaiting',
		component: AppHome,
		meta: {
			title: 'Home',
			type: 'home',
			scope: 'awardsawaiting'
		}
	},
	{
		path: '/myunredeemed',
		component: AppHome,
		meta: {
			title: 'Home',
			type: 'home',
			scope: 'unredeemed'
		}
	},
	{
		path: '*',
		redirect: '/'
	}
];
const router = new VueRouter({
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve(savedPosition);
				}, 100);
			});
		} else {
			return { x: 0, y: 0 };
		}
	}
});

export default router;
