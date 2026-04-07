<template>
  <div class="coupons-page">
    <!-- Desktop tab bar -->
    <app-tabs :options="options" v-if="!isMobile"></app-tabs>

    <!-- Toolbar: count + sort (browse and mobile) -->
    <div v-if="!isHistoryScope || isMobile" class="coupons-toolbar">
      <div class="coupons-toolbar__count">
        <strong>{{ couponsToShow.length }}</strong>
        <span> offer{{ couponsToShow.length !== 1 ? 's' : '' }}</span>
      </div>

      <app-tabs :options="options" class="coupons-toolbar__mobile-tabs" v-if="isMobile"></app-tabs>

      <div class="coupons-toolbar__controls">
        <sort-list
          :options="options"
          :coupons="couponsToShow"
          @updateSort="onSortChange"
          @updateFilters="toggleCheckbox"
          :key="scope"
        ></sort-list>

        <button class="open-button" v-if="isMobile" @click.prevent="showMobileFilters = !showMobileFilters">
          <span>&#9776; Filters</span>
        </button>
      </div>
    </div>

    <!-- History toolbar -->
    <div v-else class="history-toolbar">
      <div class="history-toolbar__select-group">
        <label class="text-label" for="history-type">Reward Type</label>
        <select
          id="history-type"
          class="history-views"
          v-model="redeemType"
          @change="changeHistoryCollection"
        >
          <option
            v-for="option in historyScopes"
            :key="option.scope"
            :value="option.scope"
          >{{ option.name }}</option>
        </select>
      </div>
      <div class="history-toolbar__count">
        <strong>{{ couponsToShow.length }}</strong> reward{{ couponsToShow.length !== 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Main content area -->
    <div class="coupons-layout">
      <!-- Filter sidebar (desktop, browse only) -->
      <aside
        class="coupons-layout__sidebar"
        role="group"
        aria-label="Filter options"
        v-if="!isHistoryScope && !isMobile"
      >
        <filters-list
          :options="options"
          :coupons="options.coupons[scope]"
          :type="type"
          v-for="(type, i) in ['category', 'brand']"
          :key="i"
          :ref="`filter_${type}`"
          @updateFilters="toggleCheckbox"
        ></filters-list>
      </aside>

      <!-- Coupon list -->
      <main
        class="coupons-layout__main"
        role="tabpanel"
        aria-live="polite"
        :class="{ 'coupons-layout__main--full': isHistoryScope }"
      >
        <coupon-list
          v-if="couponsToShow.length > 0"
          :options="options"
          :coupons="couponsToShow"
          :key="scope"
        ></coupon-list>

        <div v-else class="empty-state">
          <div class="empty-state__icon">✂</div>
          <p class="empty-state__message">
            No {{ redeemType }} offers right now.
          </p>
          <a class="empty-state__action" href="/" v-if="isHistoryScope">
            Browse All Offers
          </a>
        </div>
      </main>
    </div>

    <!-- Mobile filter overlay -->
    <div class="mobile-overlay" v-if="showMobileFilters">
      <div class="gray-overlay" @click="showMobileFilters = false"></div>
      <div class="mobile-sort-filter-options">
        <div class="top-row">
          <button class="mobile-filters-btn clear-filters-btn" @click.prevent="clearAllFilters">
            <span>Clear Filters</span>
          </button>
          <button class="mobile-filters-btn done-btn" @click.prevent="showMobileFilters = false">
            <span>Done</span>
          </button>
        </div>
        <div class="mobile-filters-body">
          <filters-list
            :options="options"
            :coupons="options.coupons[scope]"
            :type="type"
            v-for="(type, i) in ['category', 'brand']"
            :key="i"
            @updateFilters="toggleCheckbox"
          ></filters-list>
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
      const historyTab = find(this.options.tabs, { scope: SCOPES.REDEEMED });
      if (historyTab) {
        ddl = historyTab.subtabs;
      }
    }
    const redeemType = ddl.length > 0 ? ddl[0].scope : this.$route.meta.scope;
    return {
      couponsToShow: [],
      historyScopes: ddl,
      showMobileFilters: false,
      redeemType
    };
  },
  watch: {
    "$route.meta.scope"() {
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
    filterCoupons(sortValue) {
      let list = [];

      if (!this.isHistoryScope && this.options.filters[this.scope]) {
        const cpns = sortValue ? this.couponsToShow : this.options.coupons[this.scope];
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
      this.sortCoupons(sortValue, collection);
    },

    sortCoupons(sortValue, collection) {
      const key = sortValue || "";
      let sorted;

      switch (key) {
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
          sorted = sortBy(collection, [(c) => c.category]);
          break;
        default:
          sorted = orderBy(collection, ["display_start_date"], ["desc"]);
      }

      this.couponsToShow = sorted;
    },

    // Receives the sort value string directly from SortList
    onSortChange(sortValue) {
      this.filterCoupons(sortValue);
    },

    toggleCheckbox(name) {
      if (!name) return;
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
.coupons-page {
  padding-top: 8px;
}

// ── Toolbar ──────────────────────────────────────────────────────────────────
.coupons-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 0;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--color-border);
}

.coupons-toolbar__count {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  white-space: nowrap;

  strong {
    font-size: 1rem;
    color: var(--color-text);
  }
}

.coupons-toolbar__controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.coupons-toolbar__mobile-tabs {
  width: 100%;
  order: 3;
}

// ── History toolbar ───────────────────────────────────────────────────────────
.history-toolbar {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 0 12px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 4px;
}

.history-toolbar__select-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-toolbar__count {
  margin-left: auto;
  font-size: 0.875rem;
  color: var(--color-text-muted);

  strong {
    color: var(--color-text);
  }
}

// ── Main layout ───────────────────────────────────────────────────────────────
.coupons-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding-top: 16px;
}

.coupons-layout__sidebar {
  flex: 0 0 220px;
  min-width: 0;
}

.coupons-layout__main {
  flex: 1;
  min-width: 0;
}

.coupons-layout__main--full {
  flex: 1 1 100%;
}

// ── Mobile overlay ────────────────────────────────────────────────────────────
.mobile-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
}

.gray-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.mobile-sort-filter-options {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-radius: 12px 12px 0 0;
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1;
}

.top-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.mobile-filters-body {
  padding-top: 8px;
}
</style>
