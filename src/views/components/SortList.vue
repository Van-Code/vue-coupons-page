<template>
  <div id="sortby" aria-hidden="true" class="row col-sm-9 pt-0 pb-0">
    <select
      class="col-md-2 offset-md-5"
      aria-label="Sort by"
      @change="emitSortType"
      v-model="sortModel"
      v-if="!isMobile || (isMobile && coupons.length > 0)"
    >
      <option
        :data-option="type"
        class="col-md-7"
        tabindex="0"
        role="menuitem"
        :label="type.replace('_', ' ')"
        :value="type.replace('_', ' ')"
        v-for="type in sortOpts"
        :key="type"
      >{{ type.replace('_', ' ') }}</option>
    </select>

    <div class="row col-md-5 align-center" v-if="!isMobile">
      <v-autocomplete
        v-model="searchBox"
        placeholder="Enter Your Search..."
        :items="autocompleteList"
        :search-input.sync="search"
        hide-no-data
        hide-selected
        append-icon=""
      />
      <v-btn class="ml-2" @click.prevent="emitFilter">Search</v-btn>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    options: { type: Object, required: true },
    coupons: { type: Array, required: true }
  },
  data() {
    const sortOpts = this.$store.getters.isLoggedIn
      ? ["Relevance", "Most_Recent", "Expiration", "Value", "Category"]
      : ["Most_Recent", "Expiration", "Value", "Category"];

    // Build autocomplete list once from the initial coupon set
    const autocomplete = [];
    this.coupons.forEach((cpn) => {
      ["category", "brand"].forEach((type) => {
        if (cpn[type] && !autocomplete.includes(cpn[type])) {
          autocomplete.push(cpn[type]);
        }
      });
    });

    return {
      sortOpts,
      sortModel: sortOpts[0].replace("_", " "),
      autocompleteList: autocomplete,
      search: null,
      searchBox: null
    };
  },
  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    }
  },
  methods: {
    emitSortType(model) {
      this.$emit("updateSort", model);
    },
    emitFilter() {
      this.$emit("updateFilters", this.searchBox);
    }
  }
};
</script>

<style lang="scss">
</style>
