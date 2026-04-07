<template>
  <div class="coupon-col col col-xs-6 col-md-3" :data-id="model.coupon_id">
    <v-card class="coupon-card" elevation="0">
      <!-- Product Image -->
      <div class="coupon-card__image">
        <v-img :src="imgSrc" :alt="shortdesc" contain height="150" />
      </div>

      <div class="coupon-card__body">
        <!-- Title -->
        <p class="coupon-card__title" :title="titletxt">
          <span class="screen-reader-only">{{ shortalt }}</span>
          {{ titletxt }}
        </p>

        <!-- Progress (active continuity coupons only) -->
        <div class="reward-progress" v-if="model.status && scope === 'active'">
          <div class="progress-met" v-if="balance === target">&#10003; Reward criteria met</div>
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

        <!-- Expiration -->
        <p class="coupon-card__expires">{{ expirationText }}</p>
      </div>

      <!-- CTA -->
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
    </v-card>

    <!-- Error dialog -->
    <v-dialog v-model="dialog" width="460">
      <v-card>
        <v-card-title class="error-dialog__title">
          <span>Something went wrong</span>
          <v-spacer />
          <v-btn icon small @click="dialog = false">
            <span aria-label="Close">&times;</span>
          </v-btn>
        </v-card-title>
        <v-card-text class="error-dialog__body">{{ error }}</v-card-text>
        <v-card-actions class="error-dialog__actions">
          <v-spacer />
          <v-btn depressed color="primary" class="white--text" @click="dialog = false">
            Dismiss
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { couponMixin } from "@/mixins/coupons";
import { USER_STATES, SCOPES } from "@/constants";

export default {
  props: {
    coupons: { type: Array, required: true },
    options: { type: Object, required: true },
    model: { type: Object, required: true }
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
      titletxt: title,
      shortdesc: display_description,
      shortalt,
      reqdesc_summary: this.getReqdesc(60, 40),
      expirationText: this.getExpirationText(),
      imgSrc: this.model.image_uri,
      cta: this.getCta(),
      isClipping: false,
      dialog: false,
      error: ""
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
    }
  },
  methods: {
    getAvailableCpnCta() {
      const user = this.$store.state.app.user;
      const cta = { el: "a", href: "#", aria: "polite" };

      switch (user.state) {
        case USER_STATES.LOGGED_OUT:
          cta.class = "primary white--text";
          cta.content = "Login to Save";
          cta.href = user.links ? user.links.login : "#";
          break;
        case USER_STATES.SIGNED_IN_NO_CARD:
          cta.class = "primary white--text";
          cta.content = "Add Card to Save";
          cta.href = user.links ? user.links.login : "#";
          break;
        case USER_STATES.SIGNED_IN_WITH_CARD:
          cta.class = "primary white--text";
          cta.content = this.model.status ? "Start Saving" : "Load to Card";
          cta.href = "#";
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
          cta.class = "cta--muted";
          break;

        case SCOPES.CHALLENGES:
        case SCOPES.AWARDS_AWAITING:
        case SCOPES.UNREDEEMED:
        case SCOPES.ACTIVE:
          if (this.model.status) {
            const target = parseInt(this.model.status.rewards[0].progress.target);
            const balance = parseInt(this.model.status.rewards[0].progress.balance) || 0;
            cta.el = "a";

            if (balance < target) {
              cta.disabled = true;
              cta.text = true;
              cta.content = "Savings Started";
              cta.class = "cta--muted";
            } else if (balance === target) {
              const achieved = this.model.status.rewards[0].progress.achieved;
              const clipStatus = this.model.status.rewards[0].progress.clipped;
              if (achieved === "N") {
                cta.text = true;
                cta.disabled = true;
                cta.content = "Awaiting Award";
                cta.class = "cta--muted";
              } else if (clipStatus === "N") {
                cta.class = "primary white--text";
                cta.content = "Load to Card";
              }
            }
          } else {
            cta.el = "a";
            cta.disabled = true;
            cta.text = true;
            cta.content = "Coupon Loaded";
            cta.class = "cta--muted";
          }
          break;

        case SCOPES.EXPIRED:
          cta.content = "Expired";
          cta.class = "cta--muted";
          break;

        default:
          return this.getAvailableCpnCta();
      }
      return cta;
    },

    getExpirationText() {
      return "Available until " + this.model.display_end_date;
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
        data: { id: that.model.coupon_id },
        model: this.model,
        success() {
          that.isClipping = false;
          that.removeFromScope();
          const msg = that.model.status ? "Savings started!" : "Coupon loaded to your card.";
          that.$store.commit("notify", { message: msg, color: "success" });
        },
        error(response, json) {
          that.isClipping = false;
          that.error = (json.messages && json.messages[0]) || json.message || "An error occurred.";
          that.dialog = true;
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
        this.cta.class = "cta--muted";
        this.cta.text = true;
        this.cta.disabled = true;
        this.cta.content = copy;

        const idx = this.options.coupons.browse.indexOf(this.model);
        if (idx !== -1) {
          this.options.coupons.browse.splice(idx, 1);
        }
        this.options.coupons.active.unshift(this.model);
      } else {
        this.cta.el = "a";
        this.cta.class = "cta--muted";
        this.cta.text = true;
        this.cta.disabled = true;
        this.cta.content = "Coupon Loaded";
        this.options.coupons.redeemed.unshift(this.model);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.coupon-col {
  display: flex;
  padding: 8px;
}

// Card shell
.coupon-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md) !important;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm) !important;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  overflow: hidden;

  &:hover {
    box-shadow: var(--shadow-hover) !important;
    transform: translateY(-2px);
  }
}

// Image area — fixed height, neutral background
.coupon-card__image {
  background: var(--color-border-light);
  border-bottom: 1px solid var(--color-border);
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Body — grows to fill card, pushes CTA to bottom
.coupon-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 12px 14px 8px;
}

.coupon-card__title {
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text);
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.coupon-card__desc {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.45;
  margin: 0 0 auto;
  padding-bottom: 8px;
}

.coupon-card__expires {
  font-size: 0.6875rem;
  color: var(--color-text-light);
  margin: 6px 0 0;
  letter-spacing: 0.01em;
}

// CTA area
.coupon-card__actions {
  padding: 0 12px 14px !important;
}

.coupon-card__cta {
  height: 36px !important;
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.01em !important;
}

.coupon-card__cta-label {
  display: block;
  width: 100%;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  padding: 8px 0;
}

.cta--muted {
  color: var(--color-text-muted) !important;
}

// Progress indicator
.reward-progress {
  margin: 0 0 8px;
}

.progress-met {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-success);
  padding: 4px 0;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.6875rem;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.progress-pips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.pip {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-border);
  display: inline-block;
  transition: background 0.15s;
}

.pip--filled {
  background: var(--color-success);
}

// Screen reader only
.screen-reader-only {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
}

// Error dialog
.error-dialog__title {
  font-size: 1rem !important;
  font-weight: 600;
  padding: 16px 20px 8px !important;
}

.error-dialog__body {
  padding: 0 20px 16px !important;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.error-dialog__actions {
  padding: 0 20px 16px !important;
}
</style>
