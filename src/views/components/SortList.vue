<template>
  <div class="sort-bar">
    <label class="sort-bar__label" for="sort-select">Sort</label>
    <v-select
      id="sort-select"
      v-model="sortModel"
      :items="sortOptItems"
      item-text="label"
      item-value="value"
      dense
      outlined
      hide-details
      class="sort-bar__select"
      @change="emitSortValue"
    ></v-select>

    <div class="sort-bar__search" v-if="!isMobile">
      <v-autocomplete
        v-model="searchBox"
        placeholder="Search offers…"
        :items="autocompleteList"
        :search-input.sync="search"
        hide-no-data
        hide-selected
        hide-details
        dense
        outlined
        clearable
        class="sort-bar__autocomplete"
        append-icon=""
      />
      <v-btn
        depressed
        color="primary"
        class="white--text sort-bar__search-btn"
        @click.prevent="emitFilter"
      >
        Search
      </v-btn>
    </div>
  </div>
</template>

<script>
import { SORT_OPTIONS } from "@/constants";

export default {
  props: {
    options: { type: Object, required: true },
    coupons: { type: Array, required: true }
  },
  data() {
    const opts = this.$store.getters.isLoggedIn
      ? [
          SORT_OPTIONS.RELEVANCE,
          SORT_OPTIONS.MOST_RECENT,
          SORT_OPTIONS.EXPIRATION,
          SORT_OPTIONS.VALUE,
          SORT_OPTIONS.CATEGORY
        ]
      : [
          SORT_OPTIONS.MOST_RECENT,
          SORT_OPTIONS.EXPIRATION,
          SORT_OPTIONS.VALUE,
          SORT_OPTIONS.CATEGORY
        ];

    // Build autocomplete list once from initial coupon set
    const autocomplete = [];
    this.coupons.forEach((cpn) => {
      ["category", "brand"].forEach((type) => {
        if (cpn[type] && !autocomplete.includes(cpn[type])) {
          autocomplete.push(cpn[type]);
        }
      });
    });

    return {
      sortOpts: opts,
      sortModel: opts[0],
      autocompleteList: autocomplete,
      search: null,
      searchBox: null
    };
  },
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },
    sortOptItems() {
      return this.sortOpts.map((key) => ({
        value: key,
        label: key.replace("_", " ")
      }));
    }
  },
  methods: {
    emitSortValue(value) {
      this.$emit("updateSort", value);
    },
    emitFilter() {
      this.$emit("updateFilters", this.searchBox);
    }
  }
};
</script>

<style scoped lang="scss">
.sort-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-bar__label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.sort-bar__select {
  width: 160px;
  flex-shrink: 0;
}

.sort-bar__search {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-bar__autocomplete {
  width: 200px;
}

.sort-bar__search-btn {
  height: 40px !important;
  font-size: 0.8125rem !important;
}
</style>
