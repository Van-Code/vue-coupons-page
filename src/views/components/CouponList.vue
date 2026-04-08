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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-5);
  padding: var(--space-2) 0 var(--space-4);
  // Stretch all cells to equal height so cards align at their CTAs
  align-items: stretch;
}
</style>
