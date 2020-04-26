<template>
  <div :class="plural">
    <div c>
      <hr />
      <div class="py-2">
        <h5 class="sidebar-header">{{toUpperCase(plural)}}</h5>

        <div
          :class="{'categories-container':$store.state.app.responsive.current < 2, 'custom_checkboxes all_categories':true}"
          v-if="coupons.length>0"
        >
          <div role="checkbox" v-for="(model,i) in options.filters[scope][type]" :key="i">
            <label :for="model.id" role="presentation">
              <input
                type="checkbox"
                :id="model.id"
                role="presentation"
                :name="model.id"
                :checked="model.selected"
                @click="emitFilter(model.id)"
                :aria-selected="model.selected"
              />
              {{ model.id }} ({{getLength(model.id)}})
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    options: { type: Object, required: true },
    coupons: { type: Array, required: true },
    type: { type: String, required: true }
  },
  data() {
    return {};
  },
  computed: {
    plural: function() {
      return this.type === "category" ? "categories" : "brands";
    },
    scope: function() {
      return this.$route.meta.scope;
    }
  },
  methods: {
    getLength: function(name) {
      var len = this.coupons.filter(cpn => cpn[this.type] === name);
      return len.length;
    },
    toUpperCase: function(name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    },
    emitFilter: function(name) {
      this.$emit("updateFilters", name);
    },
    clearFilters: function() {
      this.options.filters[this.scope][this.type].filter(itm => {
        itm.selected = false;
      });
      this.$emit("updateFilters");
    }
  }
};
</script>