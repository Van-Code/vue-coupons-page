<template>
  <div>
    <div>
      <app-tabs :options="options" v-if="!isMobile"></app-tabs>
      <div v-if="!isHistoryScope || isMobile" class="row">
        <div :class="{ 'col-sm-3 pt-0 pb-0': !isMobile, 'show-on-mobile': isMobile }">
          <div class="coupon-savings-count-mobile">
            <strong>{{ couponsToShow.length }}</strong> coupon(s)
            <div class="mobile-filters-btn-container" v-if="isMobile">
              <button class="open-button" @click.prevent="showMobileFilters = !showMobileFilters">
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        <app-tabs :options="options" class="show-on-mobile" v-if="isMobile"></app-tabs>

        <sort-list
          id="sortby"
          aria-hidden="true"
          :options="options"
          :coupons="couponsToShow"
          @updateSort="filterCoupons"
          @updateFilters="toggleCheckbox"
          :key="scope"
        ></sort-list>
      </div>

      <div v-else>
        <!-- my history tab -->
        <div class="redeem col-sm-6 pt-0 pl-1">
          <div class="type pl-3">Clipped Reward Type:</div>
          <div class="redeem_select col-sm-6 pl-6">
            <select
              class="form-control input-sm history-views"
              v-model="redeemType"
              @change="changeHistoryCollection"
            >
              <option
                v-for="option in historyScopes"
                :key="option.name"
                :value="option.scope"
              >{{ option.name }}</option>
            </select>
          </div>
        </div>
        <div class="col-sm-6 text-right">
          <div class="coupon-savings-count redeemed">
            <h5>Rewards: <strong>{{ couponsToShow.length }}</strong></h5>
          </div>
        </div>
      </div>

      <div class="row">
        <div
          class="filters hidden-xs col-sm-3 pt-0 coupon-sidebar-container"
          role="group"
          aria-live="polite"
          v-if="!isHistoryScope"
        >
          <div class="coupon-sidebar coupon-sidebar-scrollbar">
            <filters-list
              :options="options"
              :coupons="options.coupons[scope]"
              :type="type"
              v-for="(type, i) in ['category', 'brand']"
              :key="i"
              :ref="`filter_${type}`"
              @updateFilters="toggleCheckbox"
            ></filters-list>
          </div>
        </div>

        <coupon-list
          role="tabpanel"
          aria-live="polite"
          class="row col col-sm-9 pt-0"
          :options="options"
          :coupons="couponsToShow"
          :scope="scope"
          v-if="couponsToShow.length > 0"
          :key="couponsToShow[0].coupon_id"
        ></coupon-list>

        <div
          v-else
          class="pt-0"
          :class="{ 'col-sm-12 ml-3': isHistoryScope, 'col-sm-9': !isHistoryScope }"
        >
          You currently have no {{ redeemType }} rewards.
          <br /><br />
          <a href="#browse" v-if="!isHistoryScope">Browse Rewards</a>
        </div>
      </div>
    </div>

    <!-- mobile filters overlay -->
    <div class="col-xs-12" v-if="showMobileFilters">
      <div class="mobile-sort-filter-options-container">
        <div class="gray-overlay"></div>
        <div class="mobile-sort-filter-options">
          <div class="top-row">
            <button class="mobile-filters-btn clear-filters-btn" @click.prevent="clearAllFilters">
              <span>Clear Filters</span>
            </button>
            <button
              class="mobile-filters-btn done-btn"
              @click.prevent="showMobileFilters = !showMobileFilters"
            >
              <span>Done</span>
            </button>
          </div>
          <div class="inner-options-container">
            <div class="inner-options">
              <div class="coupon-list-options">
                <form class="form-inline">
                  <label>Sort by:</label>
                  <div class="sort_select sortby form-group">
                    <sort-list
                      class="col-sm-9"
                      id="sortby-mobile"
                      aria-hidden="true"
                      :options="options"
                      :coupons="couponsToShow"
                      @updateSort="filterCoupons"
                      @updateFilters="toggleCheckbox"
                    ></sort-list>
                  </div>
                </form>
              </div>
              <div class="row">
                <div
                  class="filters coupon-sidebar-container col-xs-12"
                  role="group"
                  aria-live="polite"
                  v-if="!isHistoryScope"
                >
                  <div class="coupon-sidebar coupon-sidebar-scrollbar">
                    <filters-list
                      :options="options"
                      :coupons="options.coupons[scope]"
                      :type="type"
                      v-for="(type, i) in ['category', 'brand']"
                      :key="i"
                      :ref="`filter_mobile_${type}`"
                      @updateFilters="toggleCheckbox"
                    ></filters-list>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CouponList from "@/views/components/CouponList.vue";
import AppTabs from "@/views/components/Tabs";
import SortList from "@/views/components/SortList";
import FiltersList from "@/views/components/FiltersList";
import { SCOPES, SORT_OPTIONS } from "@/constants";
import { orderBy, sortBy, find } from "lodash";

export default {
  props: {
    options: { type: Object, required: true }
  },
  components: { CouponList, AppTabs, SortList, FiltersList },
  data() {
    let ddl = [];
    if (this.$store.getters.isLoggedIn) {
      const historyTab = find(this.options.tabs, { scope: "redeemed" });
      if (historyTab) {
        ddl = historyTab.subtabs;
      }
    }
    const redeemType =
      ddl.length > 0
        ? ddl[0].scope.replace("awardsa", "awards a")
        : this.$route.meta.scope;
    return {
      sortKey: "",
      couponsToShow: [],
      historyScopes: ddl,
      showMobileFilters: false,
      redeemType: redeemType
    };
  },
  watch: {
    "$route.meta.scope": function() {
      this.filterCoupons();
    }
  },
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },
    scope() {
      return this.$route.meta.scope || SCOPES.BROWSE;
    },
    isHistoryScope() {
      return (
        this.$store.getters.isLoggedIn &&
        this.$route.meta.scope === SCOPES.REDEEMED
      );
    }
  },
  mounted() {
    this.filterCoupons();
  },
  methods: {
    filterCoupons(sortKey) {
      const that = this;
      let list = [];

      if (!this.isHistoryScope && this.options.filters[this.scope]) {
        let cpns = sortKey ? this.couponsToShow : this.options.coupons[this.scope];

        ["category", "brand"].forEach((type) => {
          this.options.filters[this.scope][type].forEach((filter) => {
            if (filter.selected) {
              cpns.forEach((cpn) => {
                if (cpn[type] === filter.id) {
                  list.push(cpn);
                }
              });
            }
          });
        });
      }

      const collection = list.length > 0 ? list : this.options.coupons[this.scope];
      this.sortCoupons(sortKey, collection);
    },

    sortCoupons(e, collection) {
      const SORTKEY = e ? e.target.value : "";
      let sorted = [];

      switch (SORTKEY) {
        case SORT_OPTIONS.RELEVANCE:
          sorted = sortBy(collection, ["relevance_order"]);
          break;
        case SORT_OPTIONS.EXPIRATION:
          sorted = sortBy(collection, [(a) => new Date(a.expiration_date)]);
          break;
        case SORT_OPTIONS.VALUE:
          sorted = sortBy(collection, [(a) => -parseFloat(a.value)]);
          break;
        case SORT_OPTIONS.CATEGORY:
          sorted = sortBy(collection, [(cpn) => cpn.category]);
          break;
        default:
          // Most Recent is default
          sorted = orderBy(collection, ["display_start_date"], ["desc"]);
          break;
      }

      this.couponsToShow = sorted;
    },

    toggleCheckbox(name) {
      ["category", "brand"].forEach((type) => {
        this.options.filters[this.scope][type].forEach((filter) => {
          if (filter.id === name) {
            filter.selected = !filter.selected;
          }
        });
      });
      this.filterCoupons();
    },

    clearAllFilters() {
      ["category", "brand"].forEach((type) => {
        this.options.filters[this.scope][type].forEach((filter) => {
          filter.selected = false;
        });
      });
      this.filterCoupons();
    },

    changeHistoryCollection(e) {
      this.couponsToShow = this.options.coupons[e.target.value] || [];
    }
  }
};
</script>

<style scoped lang="scss">
</style>
