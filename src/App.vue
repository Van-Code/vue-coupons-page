<template>
  <div>
    <v-app class="my-app container">
      <app-shell :options="options" v-if="!isLoading"></app-shell>
    </v-app>
  </div>
</template>

<script>
import AppShell from '@/views/Shell';
import EventBus from '@/libs/eventbus.js';
import { UserMixins } from '@/entities/user';
import { Coupons } from '@/entities/coupons';

export default {
  name: 'App',
  components: {
    AppShell
  },
  mixins: [UserMixins],
  data() {
    return {
      options: {
        coupons: {},
        tabs: {},
        filters: {}
      },
      isLoading: true
    };
  },
  computed: {
    loggedIn: function() {
      return this.$store.getters.isLoggedIn;
    },
    userChecked: function() {
      return this.$store.state.app.user.checked;
    },
    scope: function() {
      return this.$route.meta.scope;
    }
  },
  mounted() {
    let that = this;
    let program = {};
    let promise = this.userCheck();
    promise.then(response => {
      if (that.userChecked) {
        that.startProgram(program);
      }
    });
    Object.assign(this.options, { scope: this.scope });
  },
  methods: {
    startProgram: function(program) {
      let that = this;
      //Build the appropriate set of tabs
      this.buildTabs(program);
      //Instantiate the main coupon collections
      let scopes = ['browse'];
      if (this.loggedIn) {
        //add redeemed back in
        scopes = scopes.concat([
          'active',
          'redeemed',
          'challenges',
          'awardsawaiting',
          'expired',
          'unredeemed'
        ]);
      }

      program.coupons = {};
      program.filters = {};

      scopes.forEach(function(scope) {
        program.coupons[scope] = [];
        program.filters[scope] = [];
      });
      let promise = that.initCouponCollection(program);
      promise
        .then(response => {
          that.createFilterIds(scopes, program);
        })
        .then(response => {
          that.isLoading = false;
        });
    },
    buildTabs: function(program) {
      let that = this;
      //The most basic logged out set of tabs
      program.tabs = [
        {
          link: 'browse',
          name: 'All Offers',
          scope: 'browse',
          subtabs: [
            {
              link: 'browse',
              name: 'All Offers',
              scope: 'browse'
            }
          ]
        }
      ];

      //If the user is logged in, add the My Coupons tab and subtabs
      if (this.loggedIn) {
        program.tabs.push({
          link: 'myactive',
          name: 'My Offers',
          scope: 'active',
          subtabs: [
            {
              link: 'myactive',
              name: 'My Offers',
              scope: 'active'
            }
          ]
        });
        program.tabs.push({
          link: 'myredeemed',
          name: 'My History',
          scope: 'redeemed',
          subtabs: [
            {
              link: 'myredeemed',
              name: 'All Redeemed',
              scope: 'redeemed'
            },
            {
              link: 'mychallenges',
              name: 'Challenge Started',
              scope: 'challenges'
            },
            {
              link: 'myawardsawaiting',
              name: 'Award Awaiting',
              scope: 'awardsawaiting'
            },
            {
              link: 'myexpired',
              name: 'Expired',
              scope: 'expired'
            },
            {
              link: 'myunredeemed',
              name: 'Unredeemed Reward',
              scope: 'unredeemed'
            }
          ]
        });
      }
      Object.assign(this.options, { tabs: program.tabs });
    },
    initCouponCollection: function(program) {
      const that = this;
      return new Promise(function(resolve, reject) {
        Object.assign(program.coupons, Coupons);
        let promise2 = that.fetchCoupons(program);
        promise2.then(response => resolve());
      });
    },
    fetchCoupons: function(program) {
      const that = this;
      return new Promise(function(resolve, reject) {
        let app = that.$store.state.app;
        var data = {
          store: that.$store
        };

        program.coupons.methods.fetch({
          data: data,
          success: function(collection) {
            let map = [];
            program.coupons.browse = collection;
            if (that.loggedIn) {
              var active = collection.filter(function(cpn) {
                return (
                  cpn.status &&
                  cpn.status.clipped === 'Y' &&
                  cpn.status.rewards[0].fully_redeemed === 'N'
                );
              });

              if (active.length > 0) {
                program.coupons.active = active;
                map = program.coupons.active.map(act => act.coupon_id);
              }

              var redeemed = collection.filter(function(cpn) {
                return (
                  cpn.clipped_coupons ||
                  (cpn.status &&
                    cpn.status.clipped === 'Y' &&
                    cpn.status.rewards[0].fully_redeemed === 'Y')
                );
              });

              if (redeemed.length > 0) {
                program.coupons.redeemed = redeemed;
                let map1 = program.coupons.redeemed.map(act => act.coupon_id);
                map.push(map1);
              }
              program.tabs.forEach(tab => {
                program.coupons[tab.scope].filter(cpn => {
                  let idx = program.coupons.browse.indexOf(cpn);
                  program.coupons.browse = program.coupons.browse.splice(idx);
                });
              });
              that.getHistoryCollections(program, program.coupons.active);
            }

            _.reject(program.coupons.browse, function(cpn) {
              !map.includes(cpn.coupon_id);
            });

            Object.assign(that.options, { coupons: program.coupons });
            resolve(that.options);
          },
          error: function(collection, json) {
            collection.error_message = json.message || json.messages[0];
          }
        });
      });
    },

    getHistoryCollections: function(program, collection) {
      var activeRewards = collection;
      var challenge_started = activeRewards.filter(function(cpn) {
        if (cpn.status) {
          var reward = cpn.status.rewards[0];
          return reward.progress.balance < reward.progress.target;
        }
      });
      if (challenge_started.length > 0) {
        program.coupons.challenges.push(challenge_started[0]);
      }
      var awardsawaiting = activeRewards.filter(function(cpn) {
        if (cpn.status) {
          var reward = cpn.status.rewards[0];
          return (
            reward.progress.clipped === 'N' &&
            cpn.status.clipped === 'Y' &&
            reward.progress.balance === reward.progress.target &&
            reward.progress.balance != 0 &&
            reward.coupon_id === ''
          );
        }
      });
      if (awardsawaiting.length > 0) {
        program.coupons.awardsawaiting.push(awardsawaiting[0]);
      }

      // filter for rewards are where today's date is greater than display_end_date
      var expired = activeRewards.filter(function(cpn) {
        var dt = new Date(cpn.display_end_date);
        return new Date() > dt;
      });
      if (expired.length > 0) {
        program.coupons.expired.push(expired[0]);
      }
      var unredeemed = activeRewards.filter(function(cpn) {
        if (cpn.status) {
          return (
            cpn.status.rewards[0].coupon_id !== '' &&
            cpn.status.rewards[0].progress.clipped === 'N'
          );
        }
      });
      if (unredeemed.length > 0) {
        program.coupons.unredeemed.push(unredeemed[0]);
      }
    },
    createFilterIds: function(scopes, program) {
      const that = this;
      return new Promise(function(resolve, reject) {
        scopes.forEach(function(scope) {
          program.filters[scope] = {};
          let newlist = [];
          if (program.coupons[scope].length > 0) {
            ['category', 'brand'].forEach(type => {
              program.filters[scope][type] = [];

              program.coupons[scope].filter((cpn, i) => {
                program.filters[scope][type].push({
                  id: cpn[type],
                  selected: false,
                  disabled: false
                });
              });
              program.filters[scope][type] = _.uniqBy(
                program.filters[scope][type],
                'id'
              );

              program.filters[scope][type].sort(function(a, b) {
                return a.id < b.id ? -1 : 0;
              });
            });
            Object.assign(that.options, { filters: program.filters });
          }
        });
      });
      resolve();
    }
  }
};
</script>
<style lang="scss">
#app.theme--light.v-application {
  background-color: #fff;
}
html {
  -webkit-font-smoothing: auto;
  font-family: "Source Sans Pro", sans-serif;
}
.coupon-app select {
  -webkit-appearance: menulist;
  -moz-appearance: menulist;
  appearance: menulist;
}
</style>
