<template>
  <div class="coupon-item" :data-id="model.coupon_id">
    <v-card class="coupon-card" elevation="0">

      <!-- Product Image + Savings Badge -->
      <div class="coupon-card__image-wrap">
        <v-img :src="imgSrc" :alt="shortdesc" contain height="140" class="coupon-card__img" />
        <div class="coupon-card__badge" v-if="savingsLabel">
          {{ savingsLabel }}
        </div>
      </div>

      <div class="coupon-card__body">
        <!-- Category chip -->
        <span class="coupon-card__category">{{ model.category }}</span>

        <!-- Title -->
        <p class="coupon-card__title" :title="titletxt">
          <span class="screen-reader-only">{{ shortalt }}</span>
          {{ titletxt }}
        </p>

        <!-- Progress (active continuity coupons only) -->
        <div class="reward-progress" v-if="model.status && scope === 'active'">
          <div class="progress-met" v-if="balance === target">
            &#10003; Reward criteria met
          </div>
          <template v-else>
            <div class="progress-label">
              <span>Progress</span>
              <span>{{ balance }} / {{ target }}</span>
            </div>
            <div class="progress-pips">
              <span
                class="pip"
                :class="{ 'pip--filled': i < balance }"
                v-for="(c, i) in target"
                :key="i"
              ></span>
            </div>
          </template>
        </div>

        <!-- Description -->
        <p class="coupon-card__desc" v-html="reqdesc_summary"></p>
      </div>

      <!-- Footer: expires + CTA -->
      <div class="coupon-card__footer">
        <p class="coupon-card__expires">{{ expirationText }}</p>

        <v-card-actions class="coupon-card__actions">
          <v-btn
            block
            depressed
            v-if="cta.el"
            :text="cta.text"
            :href="cta.href"
            :class="['coupon-card__cta', cta.class]"
            :disabled="cta.disabled || isClipping"
            :loading="isClipping"
            v-html="isClipping ? '' : cta.content"
            @click.prevent="onButtonClicked"
          ></v-btn>
          <span v-else :class="['coupon-card__cta-label', cta.class]" v-html="cta.content"></span>
        </v-card-actions>
      </div>
    </v-card>

  </div>
</template>

<script>
import { couponMixin } from "@/mixins/coupons";
import { USER_STATES, SCOPES } from "@/constants";

export default {
  props: {
    coupons: { type: Array, required: true },
    options: { type: Object, required: true },
    model:   { type: Object, required: true }
  },
  mixins: [couponMixin],
  data() {
    const title = this.model.requirement;
    const shortalt = this.model.requirement
      .replace("<strong>", " ")
      .replace("</strong>", "");
    let display_description = this.model.requirement || "";
    display_description = display_description
      .replace("$.", "$0.")
      .replace(/®/g, "&reg;")
      .replace(/&reg;/g, "<sup>&reg;</sup>");

    return {
      titletxt:        title,
      shortdesc:       display_description,
      shortalt,
      reqdesc_summary: this.getReqdesc(60, 40),
      expirationText:  this.getExpirationText(),
      imgSrc:          this.model.image_uri,
      cta:             this.getCta(),
      isClipping: false
    };
  },
  computed: {
    scope() {
      return this.$route.meta.scope;
    },
    target() {
      if (!this.model.status) return 0;
      return parseInt(this.model.status.rewards[0].progress.target);
    },
    balance() {
      if (!this.model.status) return 0;
      const b = this.model.status.rewards[0].progress.balance;
      return b !== "" ? parseInt(b) : 0;
    },
    savingsLabel() {
      const v = parseFloat(this.model.value);
      if (!v || v <= 0) return null;
      return `Save $${v.toFixed(2)}`;
    }
  },
  methods: {
    getAvailableCpnCta() {
      const user = this.$store.state.app.user;
      const cta = { el: "a", href: "#", aria: "polite" };

      switch (user.state) {
        case USER_STATES.LOGGED_OUT:
          cta.class   = "primary white--text";
          cta.content = "Login to Save";
          cta.href    = user.links ? user.links.login : "#";
          break;
        case USER_STATES.SIGNED_IN_NO_CARD:
          cta.class   = "primary white--text";
          cta.content = "Add Card to Save";
          cta.href    = user.links ? user.links.login : "#";
          break;
        case USER_STATES.SIGNED_IN_WITH_CARD:
          cta.class   = "primary white--text";
          cta.content = this.model.status ? "Start Saving" : "Load to Card";
          cta.href    = "#";
          break;
        default:
          cta.content = "View Offer";
      }
      return cta;
    },

    getCta() {
      const cta = { href: "#" };

      switch (this.$route.meta.scope) {
        case SCOPES.REDEEMED:
          cta.content = "Redeemed";
          cta.class   = "cta--muted";
          break;

        case SCOPES.CHALLENGES:
        case SCOPES.AWARDS_AWAITING:
        case SCOPES.UNREDEEMED:
        case SCOPES.ACTIVE:
          if (this.model.status) {
            const target  = parseInt(this.model.status.rewards[0].progress.target);
            const balance = parseInt(this.model.status.rewards[0].progress.balance) || 0;
            cta.el = "a";

            if (balance < target) {
              cta.disabled = true;
              cta.text     = true;
              cta.content  = "Savings Started";
              cta.class    = "cta--muted";
            } else if (balance === target) {
              const achieved   = this.model.status.rewards[0].progress.achieved;
              const clipStatus = this.model.status.rewards[0].progress.clipped;
              if (achieved === "N") {
                cta.text     = true;
                cta.disabled = true;
                cta.content  = "Awaiting Award";
                cta.class    = "cta--muted";
              } else if (clipStatus === "N") {
                cta.class   = "primary white--text";
                cta.content = "Load to Card";
              }
            }
          } else {
            cta.el       = "a";
            cta.disabled = true;
            cta.text     = true;
            cta.content  = "Coupon Loaded";
            cta.class    = "cta--muted";
          }
          break;

        case SCOPES.EXPIRED:
          cta.content = "Expired";
          cta.class   = "cta--muted";
          break;

        default:
          return this.getAvailableCpnCta();
      }
      return cta;
    },

    getExpirationText() {
      return "Exp. " + this.model.display_end_date;
    },

    onButtonClicked() {
      const user = this.$store.state.app.user;
      if (user.state === USER_STATES.SIGNED_IN_WITH_CARD) {
        this.clipCoupon();
      }
    },

    clipCoupon() {
      this.isClipping = true;
      const that = this;
      this.clip({
        data:  { id: that.model.coupon_id },
        model: this.model,
        success() {
          that.isClipping = false;
          that.removeFromScope();
          const msg = that.model.status ? "Savings started!" : "Coupon loaded to your card.";
          that.$store.commit("notify", { message: msg, color: "success" });
        },
        error(response, json) {
          that.isClipping = false;
          const msg = (json.messages && json.messages[0]) || json.message || "An error occurred.";
          that.$store.commit("notify", { message: msg, color: "error" });
        }
      });
    },

    getReqdesc(long, short) {
      let reqdesc = this.model.description;
      const bp = this.$vuetify.breakpoint;
      const charLength = bp.mdAndUp ? long : bp.smOnly ? short : 25;

      if (reqdesc.length > charLength) {
        reqdesc = reqdesc.replace(/<br ?\/?>/, "|");
        reqdesc = reqdesc.replace("|", "<br>");
        reqdesc = reqdesc.replace(/®/g, "<sup>&reg;</sup>");
      } else {
        reqdesc = reqdesc.replace(/&reg;/g, "<sup>&reg;</sup>");
      }
      return reqdesc;
    },

    removeFromScope() {
      if (this.scope === SCOPES.BROWSE) {
        const copy = this.model.status ? "Savings Started" : "Loaded to Card";
        this.cta.class    = "cta--muted";
        this.cta.text     = true;
        this.cta.disabled = true;
        this.cta.content  = copy;

        const idx = this.options.coupons.browse.indexOf(this.model);
        if (idx !== -1) this.options.coupons.browse.splice(idx, 1);
        this.options.coupons.active.unshift(this.model);
      } else {
        this.cta.el       = "a";
        this.cta.class    = "cta--muted";
        this.cta.text     = true;
        this.cta.disabled = true;
        this.cta.content  = "Coupon Loaded";
        this.options.coupons.redeemed.unshift(this.model);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
// ── Item wrapper ──────────────────────────────────────────────────────────────
// Grid already equalises row heights; the card just needs to fill the cell.
.coupon-item {
  display: flex;      // stretch card to cell height
  flex-direction: column;
}

// ── Card shell ────────────────────────────────────────────────────────────────
.coupon-card {
  display: flex;
  flex-direction: column;
  flex: 1;            // fill the .coupon-item flex container (= grid cell height)
  width: 100%;
  border: 1px solid var(--color-border) !important;
  border-radius: var(--radius-lg) !important;
  background: var(--color-surface) !important;
  box-shadow: var(--shadow-sm) !important;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  overflow: hidden;

  &:hover {
    box-shadow: var(--shadow-hover) !important;
    border-color: #CBD5E1 !important;
    transform: translateY(-2px);
  }
}

// ── Image area ────────────────────────────────────────────────────────────────
.coupon-card__image-wrap {
  position: relative;
  background: var(--color-border-light);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.coupon-card__img {
  border-radius: var(--radius-sm);
}

// Savings badge — amber pill overlaid on image
.coupon-card__badge {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  background: var(--color-accent);
  color: #fff;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 3px 8px;
  border-radius: 99px;
  line-height: 1.4;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

// ── Body ──────────────────────────────────────────────────────────────────────
.coupon-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: var(--space-3) var(--space-4) var(--space-2);
}

.coupon-card__category {
  display: inline-block;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: var(--space-1);
  line-height: 1;
}

.coupon-card__title {
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.45;
  color: var(--color-text);
  margin: 0 0 var(--space-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.coupon-card__desc {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0 0 auto;
  padding-bottom: var(--space-2);
}

// ── Footer ────────────────────────────────────────────────────────────────────
.coupon-card__footer {
  padding: 0 var(--space-4) var(--space-3);
}

.coupon-card__expires {
  font-size: 0.6875rem;
  color: var(--color-text-light);
  margin: 0 0 var(--space-2);
  letter-spacing: 0.01em;
}

.coupon-card__actions {
  padding: 0 !important;
}

.coupon-card__cta {
  height: 34px !important;
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.01em !important;
  border-radius: var(--radius-md) !important;
}

.coupon-card__cta-label {
  display: block;
  width: 100%;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  padding: var(--space-2) 0;
}

.cta--muted {
  color: var(--color-text-muted) !important;
}

// ── Progress indicator ────────────────────────────────────────────────────────
.reward-progress {
  margin: 0 0 var(--space-2);
}

.progress-met {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-success);
  padding: var(--space-1) 0;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.6875rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-1);
}

.progress-pips {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.pip {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-border);
  display: inline-block;
  transition: background 0.15s;
}

.pip--filled {
  background: var(--color-success);
}

// ── Accessibility ─────────────────────────────────────────────────────────────
.screen-reader-only {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
}

</style>
