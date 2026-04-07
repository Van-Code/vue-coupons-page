<template>
  <div>
    <v-app class="my-app container">
      <app-shell :options="options" v-if="!isLoading"></app-shell>
    </v-app>
  </div>
</template>

<script>
import AppShell from "@/views/Shell";
import { UserMixins } from "@/entities/user";
import { Coupons } from "@/entities/coupons";
import { uniqBy } from "lodash";

export default {
  name: "App",
  components: { AppShell },
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
    loggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    userChecked() {
      return this.$store.state.app.user.checked;
    }
  },
  mounted() {
    const program = {};
    Object.assign(this.options, { scope: this.$route.meta.scope });
    this.userCheck().then(() => {
      if (this.userChecked) {
        this.startProgram(program);
      }
    });
  },
  methods: {
    startProgram(program) {
      this.buildTabs(program);

      const scopes = this.loggedIn
        ? ["browse", "active", "redeemed", "challenges", "awardsawaiting", "expired", "unredeemed"]
        : ["browse"];

      program.coupons = {};
      program.filters = {};
      scopes.forEach((scope) => {
        program.coupons[scope] = [];
        program.filters[scope] = [];
      });

      this.initCouponCollection(program)
        .then(() => this.createFilterIds(scopes, program))
        .then(() => {
          this.isLoading = false;
        });
    },

    buildTabs(program) {
      program.tabs = [
        {
          link: "browse",
          name: "All Offers",
          scope: "browse",
          subtabs: [{ link: "browse", name: "All Offers", scope: "browse" }]
        }
      ];

      if (this.loggedIn) {
        program.tabs.push({
          link: "myactive",
          name: "My Offers",
          scope: "active",
          subtabs: [{ link: "myactive", name: "My Offers", scope: "active" }]
        });
        program.tabs.push({
          link: "myredeemed",
          name: "My History",
          scope: "redeemed",
          subtabs: [
            { link: "myredeemed", name: "All Redeemed", scope: "redeemed" },
            { link: "mychallenges", name: "Challenge Started", scope: "challenges" },
            { link: "myawardsawaiting", name: "Award Awaiting", scope: "awardsawaiting" },
            { link: "myexpired", name: "Expired", scope: "expired" },
            { link: "myunredeemed", name: "Unredeemed Reward", scope: "unredeemed" }
          ]
        });
      }

      Object.assign(this.options, { tabs: program.tabs });
    },

    initCouponCollection(program) {
      return new Promise((resolve) => {
        Object.assign(program.coupons, Coupons);
        this.fetchCoupons(program).then(resolve);
      });
    },

    fetchCoupons(program) {
      return new Promise((resolve, reject) => {
        program.coupons.methods.fetch({
          data: { store: this.$store },
          success: (collection) => {
            program.coupons.browse = collection;

            if (this.loggedIn) {
              const active = collection.filter(
                (cpn) =>
                  cpn.status &&
                  cpn.status.clipped === "Y" &&
                  cpn.status.rewards[0].fully_redeemed === "N"
              );
              if (active.length > 0) {
                program.coupons.active = active;
              }

              const redeemed = collection.filter(
                (cpn) =>
                  cpn.clipped_coupons ||
                  (cpn.status &&
                    cpn.status.clipped === "Y" &&
                    cpn.status.rewards[0].fully_redeemed === "Y")
              );
              if (redeemed.length > 0) {
                program.coupons.redeemed = redeemed;
              }

              this.getHistoryCollections(program, program.coupons.active);
            }

            Object.assign(this.options, { coupons: program.coupons });
            resolve();
          },
          error: (err) => {
            reject(err);
          }
        });
      });
    },

    getHistoryCollections(program, collection) {
      const activeRewards = collection;

      const challenge_started = activeRewards.filter((cpn) => {
        if (!cpn.status) return false;
        const reward = cpn.status.rewards[0];
        return reward.progress.balance < reward.progress.target;
      });
      if (challenge_started.length > 0) {
        program.coupons.challenges.push(challenge_started[0]);
      }

      const awardsawaiting = activeRewards.filter((cpn) => {
        if (!cpn.status) return false;
        const reward = cpn.status.rewards[0];
        return (
          reward.progress.clipped === "N" &&
          cpn.status.clipped === "Y" &&
          reward.progress.balance === reward.progress.target &&
          reward.progress.balance != 0 &&
          reward.coupon_id === ""
        );
      });
      if (awardsawaiting.length > 0) {
        program.coupons.awardsawaiting.push(awardsawaiting[0]);
      }

      const expired = activeRewards.filter((cpn) => {
        return new Date() > new Date(cpn.display_end_date);
      });
      if (expired.length > 0) {
        program.coupons.expired.push(expired[0]);
      }

      const unredeemed = activeRewards.filter((cpn) => {
        if (!cpn.status) return false;
        return (
          cpn.status.rewards[0].coupon_id !== "" &&
          cpn.status.rewards[0].progress.clipped === "N"
        );
      });
      if (unredeemed.length > 0) {
        program.coupons.unredeemed.push(unredeemed[0]);
      }
    },

    createFilterIds(scopes, program) {
      return new Promise((resolve) => {
        scopes.forEach((scope) => {
          program.filters[scope] = {};
          if (program.coupons[scope].length > 0) {
            ["category", "brand"].forEach((type) => {
              program.filters[scope][type] = [];
              program.coupons[scope].forEach((cpn) => {
                program.filters[scope][type].push({
                  id: cpn[type],
                  selected: false,
                  disabled: false
                });
              });
              program.filters[scope][type] = uniqBy(
                program.filters[scope][type],
                "id"
              );
              program.filters[scope][type].sort((a, b) =>
                a.id < b.id ? -1 : 0
              );
            });
          }
        });
        Object.assign(this.options, { filters: program.filters });
        resolve();
      });
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
