import Vue from 'vue';
import VueRouter from 'vue-router';
import AppHome from '@/views/Home.vue';

Vue.use(VueRouter);

const routes = [
	{
		path: '/',
		component: AppHome,
		meta: { title: 'All Offers', scope: 'browse' },
		name: 'home'
	},
	{
		path: '/myactive',
		component: AppHome,
		meta: { title: 'My Offers', scope: 'active' }
	},
	{
		path: '/myredeemed',
		component: AppHome,
		meta: { title: 'My History', scope: 'redeemed' }
	},
	{
		path: '/mychallenges',
		component: AppHome,
		meta: { title: 'Challenge Started', scope: 'challenges' }
	},
	{
		path: '/myawardsawaiting',
		component: AppHome,
		meta: { title: 'Award Awaiting', scope: 'awardsawaiting' }
	},
	{
		path: '/myexpired',
		component: AppHome,
		meta: { title: 'Expired', scope: 'expired' }
	},
	{
		path: '/myunredeemed',
		component: AppHome,
		meta: { title: 'Unredeemed Reward', scope: 'unredeemed' }
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
			return new Promise((resolve) => {
				setTimeout(() => resolve(savedPosition), 100);
			});
		}
		return { x: 0, y: 0 };
	}
});

export default router;
