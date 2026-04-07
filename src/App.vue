<template>
  <div>
    <v-app class="my-app container">
      <div v-if="isLoading" class="app-loading">
        <v-progress-circular indeterminate color="primary" size="48" width="3" />
        <span>Loading offers&hellip;</span>
      </div>
      <app-shell v-else :options="options"></app-shell>
    </v-app>
  </div>
</template>

<script>
import AppShell from "@/views/Shell";
import { UserMixins } from "@/entities/user";
import { Coupons } from "@/entities/coupons";
import { SCOPES } from "@/constants";
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
    this.userCheck().then(() => {
      if (this.userChecked) {
        this.startProgram();
      }
    });
  },
  methods: {
    startProgram() {
      const program = {};
      this.buildTabs(program);

      const scopes = this.loggedIn
        ? [
            SCOPES.BROWSE,
            SCOPES.ACTIVE,
            SCOPES.REDEEMED,
            SCOPES.CHALLENGES,
            SCOPES.AWARDS_AWAITING,
            SCOPES.EXPIRED,
            SCOPES.UNREDEEMED
          ]
        : [SCOPES.BROWSE];

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
          link: SCOPES.BROWSE,
          name: "All Offers",
          scope: SCOPES.BROWSE,
          subtabs: [{ link: SCOPES.BROWSE, name: "All Offers", scope: SCOPES.BROWSE }]
        }
      ];

      if (this.loggedIn) {
        program.tabs.push({
          link: "myactive",
          name: "My Offers",
          scope: SCOPES.ACTIVE,
          subtabs: [{ link: "myactive", name: "My Offers", scope: SCOPES.ACTIVE }]
        });
        program.tabs.push({
          link: "myredeemed",
          name: "My History",
          scope: SCOPES.REDEEMED,
          subtabs: [
            { link: "myredeemed",       name: "All Redeemed",     scope: SCOPES.REDEEMED },
            { link: "mychallenges",     name: "Challenge Started", scope: SCOPES.CHALLENGES },
            { link: "myawardsawaiting", name: "Award Awaiting",   scope: SCOPES.AWARDS_AWAITING },
            { link: "myexpired",        name: "Expired",          scope: SCOPES.EXPIRED },
            { link: "myunredeemed",     name: "Unredeemed Reward",scope: SCOPES.UNREDEEMED }
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
            program.coupons[SCOPES.BROWSE] = collection;

            if (this.loggedIn) {
              const active = collection.filter(
                (cpn) =>
                  cpn.status &&
                  cpn.status.clipped === "Y" &&
                  cpn.status.rewards[0].fully_redeemed === "N"
              );
              if (active.length > 0) {
                program.coupons[SCOPES.ACTIVE] = active;
              }

              const redeemed = collection.filter(
                (cpn) =>
                  cpn.clipped_coupons ||
                  (cpn.status &&
                    cpn.status.clipped === "Y" &&
                    cpn.status.rewards[0].fully_redeemed === "Y")
              );
              if (redeemed.length > 0) {
                program.coupons[SCOPES.REDEEMED] = redeemed;
              }

              this.getHistoryCollections(program, program.coupons[SCOPES.ACTIVE]);
            }

            Object.assign(this.options, { coupons: program.coupons });
            resolve();
          },
          error: (err) => reject(err)
        });
      });
    },

    getHistoryCollections(program, collection) {
      const challenge_started = collection.filter((cpn) => {
        if (!cpn.status) return false;
        const reward = cpn.status.rewards[0];
        return reward.progress.balance < reward.progress.target;
      });
      if (challenge_started.length > 0) {
        program.coupons[SCOPES.CHALLENGES].push(challenge_started[0]);
      }

      const awardsawaiting = collection.filter((cpn) => {
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
        program.coupons[SCOPES.AWARDS_AWAITING].push(awardsawaiting[0]);
      }

      const expired = collection.filter(
        (cpn) => new Date() > new Date(cpn.display_end_date)
      );
      if (expired.length > 0) {
        program.coupons[SCOPES.EXPIRED].push(expired[0]);
      }

      const unredeemed = collection.filter((cpn) => {
        if (!cpn.status) return false;
        return (
          cpn.status.rewards[0].coupon_id !== "" &&
          cpn.status.rewards[0].progress.clipped === "N"
        );
      });
      if (unredeemed.length > 0) {
        program.coupons[SCOPES.UNREDEEMED].push(unredeemed[0]);
      }
    },

    createFilterIds(scopes, program) {
      return new Promise((resolve) => {
        scopes.forEach((scope) => {
          program.filters[scope] = {};
          if (program.coupons[scope].length > 0) {
            ["category", "brand"].forEach((type) => {
              program.filters[scope][type] = uniqBy(
                program.coupons[scope].map((cpn) => ({
                  id: cpn[type],
                  selected: false,
                  disabled: false
                })),
                "id"
              ).sort((a, b) => (a.id < b.id ? -1 : 0));
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
