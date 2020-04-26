<template>
  <div class>
    <div class>
      <app-tabs :options="options" v-if="!isMobile"></app-tabs>
      <div v-if="!isHistoryScope || isMobile" class="row">
        <div :class="{'col-sm-3 pt-0 pb-0':!isMobile,'show-on-mobile':isMobile}">
          <div class="coupon-savings-count-mobile">
            <strong>{{couponsToShow.length}}</strong> coupon(s)
            <div class="mobile-filters-btn-container" v-if="isMobile">
              <button class="open-button" @click.prevent="showMobileFilters=!showMobileFilters">
                <h1>Filters</h1>
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
              >{{option.name}}</option>
            </select>
          </div>
        </div>
        <div class="col-sm-6 text-right">
          <div class="coupon-savings-count redeemed">
            <h5>
              Rewards:
              <strong>{{couponsToShow.length}}</strong>
            </h5>
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
              v-for="(type,i) in ['category','brand']"
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
          v-if="couponsToShow.length>0"
          :key="couponsToShow[0].coupon_id"
        ></coupon-list>

        <div
          v-else
          class="pt0"
          :class="{'col-sm-12 ml-3':isHistoryScope, 'col-sm-9':!isHistoryScope}"
        >
          {{'You currently have no '+redeemType+' rewards.'}}
          <br />
          <br />
          <a href="#browse" v-if="!isHistoryScope">Browse Rewards</a>
        </div>
      </div>
    </div>
    <div class="col-xs-12" v-if="showMobileFilters">
      <!-- mobile only -->
      <div class="mobile-sort-filter-options-container">
        <div class="gray-overlay"></div>
        <div class="mobile-sort-filter-options">
          <div class="top-row">
            <button class="mobile-filters-btn clear-filters-btn">
              <h1>Clear Filters</h1>
            </button>
            <button
              class="mobile-filters-btn done-btn"
              @click.prevent="showMobileFilters=!showMobileFilters"
            >
              <h1>Done</h1>
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
                      id="sortby"
                      aria-hidden="true"
                      :options="options"
                      :coupons="couponsToShow"
                      @updateSort="filterCoupons"
                      @updateFilters="toggleCheckbox"
                    ></sort-list>
                  </div>
                  <div class="form-group">
                    <label>Search:</label>
                    <div class="input-group">
                      <input
                        type="input"
                        placeholder="Enter Your Search..."
                        class="form-control input-sm ui-autocomplete-input"
                        autocomplete="off"
                      />
                      <span class="input-group-btn">
                        <input
                          class="form-control input-sm search-btn"
                          type="submit"
                          value="Search"
                        />
                      </span>
                    </div>
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
                      v-for="(type,i) in ['category','brand']"
                      :key="i"
                      :ref="`filter_${type}`"
                      @updateFilters="toggleCheckbox"
                    ></filters-list>
                  </div>
                </div>
              </div>
              <div class="sidebar-header-container"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EventBus from "@/libs/eventbus.js";
import CouponList from "@/views/components/CouponList.vue";
import AppTabs from "@/views/components/Tabs";
import SortList from "@/views/components/SortList";
import FiltersList from "@/views/components/FiltersList";
import orderBy from "lodash/orderBy";
import sortBy from "lodash/sortBy";

export default {
  props: {
    options: { type: Object, required: true }
  },
  components: { CouponList, AppTabs, SortList, FiltersList },
  data() {
    let ddl = [];
    if (this.$store.getters.isLoggedIn) {
      ddl = _.find(this.options.tabs, { scope: "redeemed" }).subtabs;
    }
    let redeemType =
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
    "$route.meta.scope": function(val, oldval) {
      this.filterCoupons();
    }
  },
  computed: {
    isMobile: function() {
      return this.$store.getters.isMobile;
    },
    scope: function() {
      return this.$route.meta.scope || {};
    },
    isHistoryScope: function() {
      return (
        this.$store.getters.isLoggedIn && this.$route.meta.scope === "redeemed"
      );
    }
  },
  mounted() {
    this.filterCoupons();
  },
  methods: {
    filterCoupons: function(sortKey) {
      this.collection = [];
      this.list = [];
      const that = this;
      if (!this.isHistoryScope && this.options.filters[this.scope]) {
        let cpns = this.options.coupons[this.scope];
        if (sortKey) {
          cpns = this.couponsToShow;
        }
        ["category", "brand"].forEach(type => {
          this.options.filters[this.scope][type].forEach(filter => {
            if (filter.selected) {
              cpns.filter(cpn => {
                if (cpn[type] === filter.id) {
                  that.list.push(cpn);
                }
              });
            }
          });
        });
      }
      if (this.list.length > 0) {
        this.collection = this.list;
      } else {
        this.collection = this.options.coupons[this.scope];
      }
      this.sortCoupons(sortKey, this.collection);
    },
    sortCoupons: function(e, collection) {
      const SORTKEY = e ? e.target.value : "";
      let sorted = [];
      switch (SORTKEY) {
        case "Relevance":
          sorted = sortBy(collection, ["relevance_order"]);
          break;
        case "Expiration":
          sorted = sortBy(
            collection,
            [
              a => {
                return new Date(a.expiration_date), a.coupon_id;
              }
            ],
            ["requirement_description"]
          );
          break;
        case "Value":
          sorted = sortBy(
            collection,
            [
              function(a) {
                return -parseFloat(a.value);
              }
            ],
            ["requirement_description"]
          );
          break;
        case "Category":
          sorted = sortBy(
            collection,
            [
              function(cpn) {
                return cpn.category;
              }
            ],
            "requirement_description"
          );
          break;
        default:
          //Most Recent is default
          sorted = orderBy(
            collection,
            ["display_start_date"],
            ["requirement_description"]
          );
          break;
      }
      Object.assign(this, { couponsToShow: sorted });
    },
    toggleCheckbox: function(name) {
      ["category", "brand"].forEach(type => {
        this.options.filters[this.scope][type].forEach(filter => {
          if (filter.id === name) {
            filter.selected = !filter.selected;
          }
        });
      });
      this.filterCoupons();
    },
    changeHistoryCollection: function(e) {
      this.couponsToShow = this.options.coupons[e.target.value];
    }
  }
};
</script>

<style scoped lang="scss">
</style>
