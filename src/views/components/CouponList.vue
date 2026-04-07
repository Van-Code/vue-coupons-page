<template>
  <div class="coupon-grid" ref="coupons_list">
    <coupon-item
      v-for="(cpn, i) in coupons"
      :key="`${scope}-${cpn.coupon_id}-${i}`"
      :options="options"
      :coupons="coupons"
      :model="cpn"
      ref="cpn"
    ></coupon-item>
  </div>
</template>

<script>
import CouponItem from "@/views/components/CouponItem";

export default {
  props: {
    options: { type: Object, required: true },
    coupons: { type: Array, required: true }
  },
  components: { CouponItem },
  computed: {
    scope() {
      return this.$route.meta.scope;
    }
  }
};
</script>

<style scoped lang="scss">
.coupon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 16px;
  padding: 4px 0;
}
</style>
