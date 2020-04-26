<template>
  <div class="col col-xs-6 col-sm-4 col-md-3" :data-id="model.coupon_id" :key="model.coupon_id">
    <v-card class="coupon-item">
      <v-img :src="imgSrc" :alt="shortdesc" class="ma-6" />

      <div class>
        <v-card-title v-if="titletxt">
          <span class="screen-reader-only">{{ shortalt }}</span>
          {{ titletxt }}
        </v-card-title>

        <v-card-subtitle>
          <div class="reward-progress" v-if="model.status  && scope==='active'">
            <div class="red--text" :class="{'hidden':balance!==target}">Reward criteria met</div>
            <div class="content-text">
              <div class="left">Progress</div>
              <div class="right">{{balance}} / {{target}}</div>
            </div>
            <div class="content-circle">
              <div class="circle" :class="{'active':i<balance}" v-for="(c,i) in target" :key="i"></div>
            </div>
          </div>

          <div v-html="reqdesc_summary"></div>
        </v-card-subtitle>
        <v-card-subtitle class="reqdesc" style="display:none" v-html="reqdesc"></v-card-subtitle>

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
          <v-btn text class="title-bar-close" @click="dialog=false"></v-btn>
        </v-card-title>
        <v-card-text>{{error}}</v-card-text>
        <v-card-actions>
          <v-btn color="primary" class="white--text" left @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import EventBus from "@/libs/eventbus.js";
import { couponMixin } from "@/mixins/coupons";
import omit from "lodash/omit";
export default {
  props: {
    coupons: { type: Array, required: true },
    options: { type: Object, required: true },
    model: { type: Object, required: true }
  },
  mixins: [couponMixin],
  data() {
    var title = this.model.requirement,
      unlimited_text = "Unlimited Use",
      shortalt = this.model.requirement
        .replace("<strong>", " ")
        .replace("</strong>", ""),
      display_description = this.model.requirement || "";
    display_description = display_description
      .replace("$.", "$0.")
      .replace(/®/g, "&reg;")
      .replace(/&reg;/g, "<sup>&reg;</sup>");
    return {
      //Get the placement of the view, for tracking purposes
      doRender: this.options.doRender,
      titletxt: title,
      shortdesc: display_description,
      shortalt: shortalt,
      reqdesc_summary: this.getReqdesc(60, 40),
      reqdesc: this.model.description,
      expirationText: this.getExpirationText(),
      clickpath_pref: this.options.clickpath_pref,
      unlimited_text: unlimited_text,
      imgSrc: this.model.image_uri,
      cta: this.getCta(),
      dialog: false,
      error: ""
    };
  },
  computed: {
    scope: function() {
      return this.$route.meta.scope;
    },
    target: function() {
      return parseInt(this.model.status.rewards[0].progress.target);
    },
    balance: function() {
      return this.model.status.rewards[0].progress.balance !== ""
        ? parseInt(this.model.status.rewards[0].progress.balance)
        : 0;
    }
  },
  methods: {
    getAvailableCpnCta: function() {
      var that = this,
        user = this.$store.state.app.user,
        btnClass = that.options.btnClass,
        cta = {
          el: "a",
          class: btnClass + " primary ",
          aria: "polite"
        };

      switch (user.state) {
        case 0:
          cta.class = btnClass + " primary";
          cta.content = "<strong>Login to Save</strong>";
          cta.href = user.links.login;
          break;
        case 2:
          cta.class = "primary";
          cta.content = this.model.status
            ? "Start the Savings"
            : "Load to Card";
          cta.href = "#";
      }
      return cta;
    },
    getCta: function() {
      var that = this,
        cta = {};
      cta.href = "#";
      //From standard get coupon APIs
      switch (this.$route.meta.scope) {
        case "redeemed":
          cta.content = "<strong>Redeemed</strong>";
          break;
        case "challenges":
        case "awardsawaiting":
        case "unredeemed":
        case "active":
          //continuity threshold
          if (that.model.status) {
            var target = parseInt(that.model.status.rewards[0].progress.target);
            //threshold met
            var balance =
              parseInt(that.model.status.rewards[0].progress.balance) || 0;
            cta.el = "el";
            if (balance >= 0 && balance < target) {
              cta.disabled = true;
              cta.text = true;
              cta.content = "Savings Started";
            }
            if (balance === target) {
              var reward_clip_status =
                that.model.status.rewards[0].progress.clipped;
              var achieved_status =
                that.model.status.rewards[0].progress.achieved;
              //has met criteria
              if (achieved_status === "N") {
                cta.text = true;
                cta.disabled = true;
                cta.content = "Awaiting Award";
                //has not loaded reward yet
              } else if (reward_clip_status === "N") {
                cta.class += " primary";
                cta.content = "Load to Card";
              }
            }
          } else {
            //reward offer
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
          cta = that.getAvailableCpnCta();
      }
      return cta;
    },

    getProgress: function() {
      var content = "";
      var classes = "circle";
      if (this.model.status) {
        var target = this.model.status.rewards[0].progress.target;
        //threshold met
        var balance =
          this.model.status.rewards[0].progress.balance !== ""
            ? this.model.status.rewards[0].progress.balance
            : 0;
        if (balance === target) {
          content = '<div class="red--text">Reward criteria met</div>';
        } else {
          content = '<div class="content-text">';
          content +=
            '<div class="left">Progress</div><div class="right">' +
            balance +
            "/" +
            target +
            "</div>";
          content += "</div>";

          content += '<div class="content-circle">';

          for (var i = 0; i < target; i++) {
            var classes = "circle";
            if (i < balance) {
              classes = "circle active";
            }
            content += '<div class="' + classes + '"></div>';
          }
          content += "</div>";
        }
      }
      return content;
    },
    getExpirationText: function() {
      var status = true;
      var expiration_date = this.model.display_end_date,
        prefix = "Complete By: ";
      if (status) {
        prefix = "Available Until: ";
      } else {
        prefix = "Load by: ";
      }

      return prefix + expiration_date;
    },
    onButtonClicked: function(e) {
      var that = this;
      var user = this.$store.state.app.user;
      //Different behavior for button click, depending on user state
      if (user.state > 1) {
        this.clipCoupon(e);
      }
    },
    clipCoupon: function(e) {
      var that = this;
      var $btn = e.target;
      //show loading and add clickpath for omniture
      e.target.className += " loading";
      this.clip({
        data: {
          id: that.model.coupon_id
        },
        model: this.model,
        success: function(response) {
          that.removeFromScope(that.model);
        },
        error: function(response, json) {
          e.target.className.replace("loading", "");
          that.error = json.messages[0];
          that.dialog = true;
        }
      });
    },
    getReqdesc: function(long, short, override) {
      //Trim length of requirement description
      var reqdesc = this.model.description,
        charLength = override
          ? long
          : this.$store.state.app.responsive.current === 2
          ? long
          : this.$store.state.app.responsive.current === 1
          ? short
          : 25;
      if (reqdesc.length > charLength) {
        reqdesc = reqdesc.replace(/<br ?\/?>/, "|");
        reqdesc = reqdesc.replace("|", "<br>");
        reqdesc = reqdesc.replace(/®/g, "<sup>&reg;</sup>");
      } else {
        reqdesc = reqdesc.replace(/&reg;/g, "<sup>&reg;</sup>");
      }
      return reqdesc;
    },
    removeFromScope: function(e) {
      let that = this;
      this.model.clipped_coupons = true;
      //clipping from browse scope
      if (this.scope === "browse") {
        //is continuity offer
        if (this.model.status) {
          var copy = "Savings Started";
        } else {
          var copy = "Loaded to Card";
        }
        // e.target.className.replace('loading', '');

        this.cta.class = "black--text";
        this.cta.text = true;
        this.cta.disabled = true;
        this.cta.content = '<span class="cta_muted">' + copy + "</span>";

        _.omit(this.options.coupons.browse, this.model);
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
/* Criteria Met */
.reward-progress {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.reward-progress .criteria-met {
  color: #2fa86e;
  text-align: center;
}
.reward-progress .criteria-met i {
  padding-right: 5px;
}
</style>