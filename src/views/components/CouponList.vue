<template>
  <div ref="coupons_list">
    <coupon-item
      :options="options"
      :coupons="coupons"
      :model="cpn"
      v-for="(cpn,i) in coupons"
      :key="`${$route.meta.scope}${i}`"
      ref="cpn"
    ></coupon-item>
  </div>
</template>
<script>
import CouponItem from '@/views/components/CouponItem';
export default {
  props: {
    options: { type: Object, required: true },
    coupons: { type: Array, required: true }
  },
  components: { CouponItem },
  computed: {
    scope: function() {
      return this.$route.meta.scope;
    }
  }
};
</script>