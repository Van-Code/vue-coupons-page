<template>
  <div id="sortby" aria-hidden="true" class="row col-sm-9 pt-0 pb-0">
    <select
      class="col-md-2 offset-md-5"
      @change="emitSortType"
      v-model="sortModel"
      type="menulist"
      outlined
      v-if="!isMobile || isMobile && coupons.length>0"
    >
      <option
        :data-option="type"
        class="col-md-7"
        outlined
        tabindex="0"
        role="menuitem"
        :label="type.replace('_',' ')"
        :value="type.replace('_',' ')"
        v-for="type in sortOpts"
        :key="type"
      >
        <div class="screen-reader-only">Sort by</div>
      </option>
    </select>
    <div class="row col-md-5 align-center" v-if="!isMobile">
      <v-autocomplete
        v-model="searchBox"
        placeholder="Enter Your Search..."
        :items="autocompleteList"
        :search-input.sync="search"
        hide-no-data
        hide-selected
        append-icon
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
  watch: {
    search(val) {
      const that = this;
      this.coupons.filter(cpn => {
        ['category', 'brand'].forEach(type => {
          that.autocompleteList.push(cpn[type]);
        });
      });
    }
  },
  data() {
    let sortOpts = ['Most_Recent', 'Expiration', 'Value', 'Category'];
    if (this.$store.getters.isLoggedIn) {
      sortOpts.unshift('Relevance');
    }
    let autocomplete = [];
    return {
      pagination: {
        collectionLength: this.coupons.length,
        currentPage: 1,
        perPage: 20,
        lastPage: Math.ceil(this.coupons.length / 20),
        showAll: false
      },
      sortOpts: sortOpts,
      sortModel: sortOpts[0].replace('_', ' '),
      autocompleteList: autocomplete,
      search: null,
      searchBox: null
    };
  },
  computed: {
    isMobile: function() {
      return this.$store.getters.isMobile;
    }
  },
  methods: {
    emitSortType: function(model) {
      this.$emit('updateSort', model);
    },
    emitFilter: function() {
      this.$emit('updateFilters', this.searchBox);
    }
  }
};
</script>
<style lang="scss">
</style>