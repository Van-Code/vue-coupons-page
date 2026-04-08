<template>
  <div>
    <!-- ── App Bar ─────────────────────────────────────────────────────────── -->
    <v-app-bar app flat color="white" height="60">
      <a class="app-bar__brand" href="/">
        <v-icon color="primary" size="22">mdi-tag-multiple</v-icon>
        <span class="app-bar__logo">Save<span>More</span></span>
      </a>

      <v-spacer />

      <span class="app-bar__tagline hidden-sm-and-down">Grocery Coupons &amp; Deals</span>
    </v-app-bar>

    <!-- ── Page Content ───────────────────────────────────────────────────── -->
    <v-main>
      <v-container class="page-container" fluid>
        <router-view class="page-content" :options="options" />
      </v-container>
    </v-main>

    <!-- ── Global Snackbar ────────────────────────────────────────────────── -->
    <v-snackbar
      v-model="notification.show"
      :color="notification.color"
      top
      right
      :timeout="3500"
      @input="onSnackbarChange"
    >
      {{ notification.message }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="$store.commit('clearNotification')">
          Dismiss
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  props: {
    options: { type: Object, required: true }
  },
  computed: {
    notification() {
      return this.$store.state.notification;
    }
  },
  methods: {
    onSnackbarChange(val) {
      if (!val) this.$store.commit('clearNotification');
    }
  }
};
</script>

<style lang="scss">
// App bar border-bottom (flat bars have no elevation)
.v-app-bar.v-app-bar--fixed {
  border-bottom: 1px solid var(--color-border) !important;
}

.app-bar__tagline {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: 500;
  letter-spacing: 0.01em;
  margin-right: var(--space-2);
}

.page-container {
  padding: var(--space-6) var(--space-4);
}

@media (min-width: 960px) {
  .page-container {
    padding: var(--space-8) var(--space-8);
  }
}
</style>
