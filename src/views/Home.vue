<template>
  <div>
    <app-coupons class="coupons col-12 pt-0" :options="options"></app-coupons>
  </div>
</template>

<script>
import AppCoupons from '@/views/Coupons';
export default {
  props: {
    options: { type: Object, required: true }
  },
  components: { AppCoupons }
};
</script>
