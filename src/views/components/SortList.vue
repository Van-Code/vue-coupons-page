<template>
  <div class="sort-bar">
    <span class="sort-bar__label">Sort</span>
    <select
      id="sort-select"
      class="sort-bar__select"
      v-model="sortModel"
      @change="emitSortValue(sortModel)"
    >
      <option
        v-for="opt in sortOptItems"
        :key="opt.value"
        :value="opt.value"
      >{{ opt.label }}</option>
    </select>
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

    return {
      sortOpts:  opts,
      sortModel: opts[0]
    };
  },
  computed: {
    sortOptItems() {
      return this.sortOpts.map((key) => ({
        value: key,
        label: key.replace(/_/g, " ")
      }));
    }
  },
  methods: {
    emitSortValue(value) {
      this.$emit("updateSort", value);
    }
  }
};
</script>

<style scoped lang="scss">
.sort-bar {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0 var(--space-3) 0 var(--space-4);
  height: 36px;
}

.sort-bar__label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  user-select: none;
}

// Divider between label and select
.sort-bar__label::after {
  content: '';
  display: inline-block;
  width: 1px;
  height: 14px;
  background: var(--color-border);
  margin-left: var(--space-2);
  vertical-align: middle;
}

.sort-bar__select {
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-text);
  font-family: var(--font-sans);
  cursor: pointer;
  padding: 0;
  appearance: auto; // keep native arrow for clarity
  min-width: 120px;

  &:focus {
    outline: none;
  }
}
</style>
