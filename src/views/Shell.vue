<template>
  <v-container>
    <router-view class="page_content" :options="options"></router-view>

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
  </v-container>
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
