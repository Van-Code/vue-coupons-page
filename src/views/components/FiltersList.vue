<template>
  <div class="filter-section">
    <h6 class="filter-section__heading">{{ toUpperCase(plural) }}</h6>
    <div class="filter-section__list" v-if="coupons.length > 0">
      <label
        class="filter-option"
        v-for="(model, i) in options.filters[scope][type]"
        :key="i"
        :for="`filter-${model.id}`"
      >
        <input
          type="checkbox"
          :id="`filter-${model.id}`"
          :name="model.id"
          :checked="model.selected"
          class="filter-option__checkbox"
          @change="emitFilter(model.id)"
          :aria-checked="model.selected"
        />
        <span class="filter-option__label">{{ model.id }}</span>
        <span class="filter-option__count">({{ getLength(model.id) }})</span>
      </label>
    </div>
    <p class="filter-section__empty" v-else>No options available</p>
  </div>
</template>

<script>
export default {
  props: {
    options: { type: Object, required: true },
    coupons: { type: Array, required: true },
    type:    { type: String, required: true }
  },
  computed: {
    plural() {
      return this.type === "category" ? "Categories" : "Brands";
    },
    scope() {
      return this.$route.meta.scope;
    }
  },
  methods: {
    getLength(name) {
      return this.coupons.filter((cpn) => cpn[this.type] === name).length;
    },
    toUpperCase(name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    },
    emitFilter(name) {
      this.$emit("updateFilters", name);
    },
    clearFilters() {
      this.options.filters[this.scope][this.type].forEach((itm) => {
        itm.selected = false;
      });
      this.$emit("updateFilters");
    }
  }
};
</script>

<style scoped lang="scss">
.filter-section {
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
}

.filter-section__heading {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0 0 10px;
}

.filter-section__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  cursor: pointer;
  border-radius: 4px;

  &:hover .filter-option__label {
    color: var(--color-primary);
  }
}

.filter-option__checkbox {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.filter-option__label {
  font-size: 0.8125rem;
  color: var(--color-text);
  flex: 1;
  line-height: 1.4;
  transition: color 0.15s;
}

.filter-option__count {
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.filter-section__empty {
  font-size: 0.8125rem;
  color: var(--color-text-light);
  margin: 0;
}
</style>
