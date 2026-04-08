<template>
  <div class="tab-bar">
    <!-- Desktop: Vuetify tabs -->
    <v-tabs
      v-if="$vuetify.breakpoint.mdAndUp"
      background-color="transparent"
      height="44"
      :slider-size="2"
    >
      <v-tab
        v-for="(tab, i) in options.tabs"
        :key="i"
        :to="tab.link === 'browse' ? '/' : `/${tab.link}`"
        exact
      >
        {{ tab.name }}
      </v-tab>
    </v-tabs>

    <!-- Mobile: native select -->
    <select
      v-else
      class="tab-select"
      @change="updateRoute"
      v-model="currentTab"
      aria-label="Navigate sections"
    >
      <option
        v-for="(tab, i) in mobileTabs"
        :key="i"
        :value="tab.link"
      >{{ tab.name }}</option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    options: { type: Object, required: true }
  },
  data() {
    return { currentTab: "" };
  },
  computed: {
    scope() {
      return this.$route.meta.scope;
    },
    mobileTabs() {
      return this.$route.meta.scope !== "browse"
        ? this.options.tabs
        : [{ name: "All Offers", scope: "browse", link: "browse" }];
    }
  },
  mounted() {
    this.findSelected();
  },
  methods: {
    updateRoute(e) {
      const link = e.target.value;
      this.$router.push(link === "browse" ? "/" : `/${link}`);
    },
    findSelected() {
      const found =
        this.mobileTabs.find((tab) => tab.scope === this.$route.meta.scope) ||
        this.mobileTabs[0];
      this.currentTab = found.link;
    }
  }
};
</script>

<style scoped lang="scss">
.tab-bar {
  margin-bottom: 0;
}

.tab-select {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-surface);
  font-family: var(--font-sans);
  appearance: menulist;

  &:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 1px;
  }
}
</style>
