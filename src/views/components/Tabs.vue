<template>
  <div class="tab-bar">
    <!-- Desktop: Vuetify tabs -->
    <v-tabs v-if="$vuetify.breakpoint.mdAndUp" background-color="transparent" height="48">
      <v-tab
        v-for="(tab, i) in options.tabs"
        :key="i"
        :to="tab.link === 'browse' ? '/' : `/${tab.link}`"
        :class="{ 'v-tab--active': scope === tab.scope }"
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
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-surface);
  appearance: menulist;

  &:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 1px;
  }
}
</style>
