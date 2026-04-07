<template>
  <div class="col col-xs-6 col-sm-4 col-md-3" :data-id="model.coupon_id" :key="model.coupon_id">
    <v-card class="coupon-item">
      <v-img :src="imgSrc" :alt="shortdesc" class="ma-6" />

      <div>
        <v-card-title v-if="titletxt">
          <span class="screen-reader-only">{{ shortalt }}</span>
          {{ titletxt }}
        </v-card-title>

        <v-card-subtitle>
          <div class="reward-progress" v-if="model.status && scope === 'active'">
            <div class="red--text" :class="{ hidden: balance !== target }">Reward criteria met</div>
            <div class="content-text">
              <div class="left">Progress</div>
              <div class="right">{{ balance }} / {{ target }}</div>
            </div>
            <div class="content-circle">
              <div class="circle" :class="{ active: i < balance }" v-for="(c, i) in target" :key="i"></div>
            </div>
          </div>
          <div v-html="reqdesc_summary"></div>
        </v-card-subtitle>

        <v-card-text>{{ expirationText }}</v-card-text>
      </div>

      <hr />

      <v-card-actions>
        <v-btn
          block
          v-if="cta.el"
          role="link"
          :text="cta.text"
          :href="cta.href"
          :class="cta.class"
          v-html="cta.content"
          :disabled="cta.disabled"
          @click.prevent="onButtonClicked"
        ></v-btn>
        <span v-else :class="cta.class" v-html="cta.content"></span>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title>
          <h3>Error</h3>
          <div class="spacer"></div>
          <v-btn text class="title-bar-close" @click="dialog = false"></v-btn>
        </v-card-title>
        <v-card-text>{{ error }}</v-card-text>
        <v-card-actions>
          <v-btn color="primary" class="white--text" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { couponMixin } from "@/mixins/coupons";

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
      shortalt: shortalt,
      reqdesc_summary: this.getReqdesc(60, 40),
      expirationText: this.getExpirationText(),
      imgSrc: this.model.image_uri,
      cta: this.getCta(),
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
      const btnClass = this.options.btnClass || "";
      const cta = { el: "a", href: "#", aria: "polite" };

      switch (user.state) {
        case 0:
          cta.class = btnClass + " primary";
          cta.content = "<strong>Login to Save</strong>";
          cta.href = user.links ? user.links.login : "#";
          break;
        case 1:
          cta.class = btnClass + " primary";
          cta.content = "<strong>Add Card to Save</strong>";
          cta.href = user.links ? user.links.login : "#";
          break;
        case 2:
          cta.class = "primary";
          cta.content = this.model.status ? "Start the Savings" : "Load to Card";
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
        case "redeemed":
          cta.content = "<strong>Redeemed</strong>";
          break;

        case "challenges":
        case "awardsawaiting":
        case "unredeemed":
        case "active":
          if (this.model.status) {
            const target = parseInt(this.model.status.rewards[0].progress.target);
            const balance =
              parseInt(this.model.status.rewards[0].progress.balance) || 0;
            cta.el = "a";

            if (balance >= 0 && balance < target) {
              cta.disabled = true;
              cta.text = true;
              cta.content = "Savings Started";
            } else if (balance === target) {
              const reward_clip_status = this.model.status.rewards[0].progress.clipped;
              const achieved_status = this.model.status.rewards[0].progress.achieved;
              if (achieved_status === "N") {
                cta.text = true;
                cta.disabled = true;
                cta.content = "Awaiting Award";
              } else if (reward_clip_status === "N") {
                cta.class = "primary";
                cta.content = "Load to Card";
              }
            }
          } else {
            cta.el = "a";
            cta.disabled = true;
            cta.text = true;
            cta.content = "Coupon Loaded";
          }
          break;

        case "expired":
          cta.content = "Expired";
          break;

        default:
          return this.getAvailableCpnCta();
      }
      return cta;
    },

    getExpirationText() {
      const expiration_date = this.model.display_end_date;
      return "Available Until: " + expiration_date;
    },

    onButtonClicked() {
      const user = this.$store.state.app.user;
      if (user.state > 1) {
        this.clipCoupon();
      }
    },

    clipCoupon() {
      const that = this;
      this.clip({
        data: { id: that.model.coupon_id },
        model: this.model,
        success(response) {
          that.removeFromScope(that.model);
        },
        error(response, json) {
          that.error = (json.messages && json.messages[0]) || json.message || "An error occurred.";
          that.dialog = true;
        }
      });
    },

    getReqdesc(long, short) {
      let reqdesc = this.model.description;
      const responsive = this.$store.state.app.responsive.current;
      const charLength = responsive === 2 ? long : responsive === 1 ? short : 25;

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
      if (this.scope === "browse") {
        const copy = this.model.status ? "Savings Started" : "Loaded to Card";

        this.cta.class = "black--text";
        this.cta.text = true;
        this.cta.disabled = true;
        this.cta.content = `<span class="cta_muted">${copy}</span>`;

        // Remove from browse, add to active
        const idx = this.options.coupons.browse.indexOf(this.model);
        if (idx !== -1) {
          this.options.coupons.browse.splice(idx, 1);
        }
        this.options.coupons.active.unshift(this.model);
      } else {
        this.cta.el = "a";
        this.cta.class = "black--text";
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
.screen-reader-only {
  position: fixed;
  left: -9999px;
  width: 1px;
  height: 1px;
  top: auto;
}
.v-card__title {
  font-size: 0.9em;
  line-height: 1.5;
  word-break: break-word;
}
.v-card__actions .v-btn {
  font-size: 0.7em;
  font-weight: bold;
}

/* Progress Bar */
.reward-progress {
  margin: 1em auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.content-text {
  width: 90%;
  margin: 0 auto 0.5em;
  display: flex;
  justify-content: space-between;
}
.content-circle {
  width: 90%;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.content-circle .circle {
  background: #ccc;
  border-radius: 50%;
  height: 15px;
  width: 15px;
  margin: 0 2% 4%;
}
.content-circle .circle.active {
  background: #2fa86e;
}
.hidden {
  visibility: hidden;
}
.reward-progress .criteria-met {
  color: #2fa86e;
  text-align: center;
}
</style>
