<template>
  <div class="row mb-4">
    <v-tabs v-if="$store.state.app.responsive.current===2" align-with-title height="auto">
      <div
        role="presentation"
        v-for="(x,i) in options.tabs"
        :key="i"
        :class="{active:scope===x.scope}"
      >
        <v-tab class="py-2" :to="x.link==='browse'?'/':x.link">{{x.name}}</v-tab>
      </div>
    </v-tabs>
    <!-- mobile -->
    <div class v-else>
      <select @change="updateRoute" v-model="currentTab">
        >
        <option
          v-for="(x,i) in mobileTabs"
          :key="i"
          :value="x.link"
          :label="x.name"
          :class="{active:scope===x.scope}"
        >{{x.name}}</option>
      </select>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    options: { type: Object, required: true }
  },
  data() {
    return {
      currentTab: ''
    };
  },
  computed: {
    scope: function() {
      return this.$route.meta.scope;
    },
    isMobile: function() {
      return this.$store.getters.isMobile;
    },
    mobileTabs: function() {
      return this.$route.meta.scope !== 'browse'
        ? this.options.tabs
        : [{ name: 'All Bonus Savings', scope: 'browse', link: 'browse' }];
    }
  },
  mounted() {
    this.findSelected();
  },
  methods: {
    updateRoute: function(e) {
      this.$router.push(`/${e.target.value}`);
    },
    findSelected: function() {
      var found = this.mobileTabs.find(
        tab => tab.scope === this.$route.meta.scope
      );
      if (!found) {
        found = this.mobileTabs[0];
      }
      this.currentTab = found.link;
    }
  }
};
</script>