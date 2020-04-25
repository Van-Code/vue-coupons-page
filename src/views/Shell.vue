<template>
  <v-container>
    <router-view class="page_content" :options="options"></router-view>
  </v-container>
</template>
<script>
export default {
  props: { options: { type: Object, required: true } }
};
</script>