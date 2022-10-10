<template>
  <div id="app">
    <b-navbar class="is-primary" fixed-top :mobile-burger="true">
      <template #brand>
        <b-navbar-item tag="router-link" :to="{ name: 'Home' }">
          <img src="@/assets/images/catalyst.png" alt="Project Catalyst" />
        </b-navbar-item>
        <b-navbar-item class="has-text-weight-bold" v-if="secsToAssess < 0 && secsToEndAssess > 0">
          <counter
            :text="'End of Assess Stage:'"
            :small="true"
            :d="toEndAssess.d"
            :h="toEndAssess.h"
            :m="toEndAssess.m"
            :s="toEndAssess.s"
          />
        </b-navbar-item>
      </template>
      <template #start>
        <b-navbar-item v-if="!$store.state.wallet.availableWallets">
          Detecting wallets...
        </b-navbar-item>
        <b-navbar-item v-else-if="!$store.state.wallet.availableWallets.length">
          No wallets detected
        </b-navbar-item>
        <b-navbar-dropdown
          label="Connect wallet"
          v-else-if="!$store.state.wallet.walletApi && !$store.state.wallet.isConnecting"
        >
          <b-navbar-item
            v-for="walletName in $store.state.wallet.availableWallets"
            :key="walletName"
            @click="$store.dispatch('wallet/connectWallet', walletName)"
          >
            {{ walletName }}
          </b-navbar-item>
        </b-navbar-dropdown>
        <b-navbar-item v-else-if="$store.state.wallet.isConnecting">
          Connecting wallet...
        </b-navbar-item>
        <b-navbar-item v-else-if="$store.state.wallet.walletApi">
          Wallet connected ({{ $store.state.wallet.walletName }})
        </b-navbar-item>
        <b-navbar-dropdown label="Select fund" v-if="$store.state.funds.fundsList.length">
          <b-navbar-item
            v-for="fund in $store.state.funds.fundsList"
            :key="fund.json.fundHash"
            :active="
              $store.state.funds.selectedFund &&
                $store.state.funds.selectedFund.json.fundHash === fund.json.fundHash
            "
            @click="selectFund(fund.json.fundHash)"
          >
            {{ fund.json.title }}
          </b-navbar-item>
        </b-navbar-dropdown>
        <b-navbar-item v-else-if="$store.state.funds.isLoading">
          Loading funds...
        </b-navbar-item>
      </template>
      <template #end>
        <b-navbar-dropdown label="Proposals">
          <b-navbar-item @click="next">
            Suggest next proposal
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{ name: 'Proposals' }">
            List
          </b-navbar-item>
        </b-navbar-dropdown>
        <b-navbar-item tag="router-link" :to="{ name: 'ExampleAssessments' }">
          Example Assessments
        </b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ name: 'Assessed' }">
          {{ myAssessmentsLink }}
        </b-navbar-item>
        <b-navbar-dropdown right label="PA Resources">
          <b-navbar-item
            tag="a"
            target="_blank"
            href="https://www.youtube.com/playlist?list=PLDLKmC_jWczVff7Gv6J5nmKLl52mVCT9q"
          >
            Catalyst School workshops for PAs
          </b-navbar-item>
          <b-navbar-item
            tag="a"
            target="_blank"
            href="https://docs.google.com/document/d/1g-iZhDlKhUBZkui1uv8NVNfJC4oVD3JtR-P6Fue7XPU"
          >
            PA Guide
          </b-navbar-item>
          <b-navbar-item tag="a" target="_blank" href="https://t.me/CatalystCommunityAdvisors">
            Telegram PAs chat
          </b-navbar-item>
        </b-navbar-dropdown>
      </template>
    </b-navbar>
    <div class="section container">
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
    <footer class="footer">
      <div class="content has-text-centered">
        <p>Made by Catalyst Community for the Catalyst Community</p>
        <p><img class="aim-logo" src="@/assets/images/aim-logo.png" alt="Cardano AIM" /></p>
        <p class="is-size-4 has-text-weight-bold">
          <a
            href="https://cardanoscan.io/pool/b61f05ec1e907ab9b069eaec6c664056c16f56cab59076109c66d2ae"
            target="_blank"
          >
            Stake with [AIM] pool
          </a>
        </p>
        <p class="icons">
          <a href="https://github.com/Project-Catalyst/ca-tool" target="_blank">
            <b-icon icon="github" size="small" />
          </a>
          <a href="https://twitter.com/AimCardano" target="_blank">
            <b-icon icon="twitter" size="small" />
          </a>
          <a href="https://t.me/joinchat/Ivl50eWG7r0zODI1" target="_blank">
            <b-icon icon="telegram" size="small" />
          </a>
        </p>
        <b-button
          label="Feedback"
          type="is-primary"
          icon-left="message-reply-text"
          tag="a"
          target="_blank"
          href="https://forms.gle/7AhvFHeuL5r3VtkBA"
        >
        </b-button>
      </div>
    </footer>
    <landing />
  </div>
</template>

<script>
import { Address } from "@emurgo/cardano-serialization-lib-asmjs";
import { mapGetters } from "vuex";
import Landing from "@/views/Landing";
import Counter from "@/components/Counter";
import extractStakeAddress from "@/utils/extractStakeAddress";

export default {
  data() {
    return {
      assessStartsUTC: this.$dayjs.utc("2022-06-30 11:00:00", "YYYY-MM-DD HH:mm:ss"),
      assessEndsUTC: this.$dayjs.utc("2022-07-14 11:00:00", "YYYY-MM-DD HH:mm:ss"),
      now: this.$dayjs()
        .utc()
        .unix(),
      interval: false,
    };
  },
  components: {
    Landing,
    Counter,
  },
  computed: {
    ...mapGetters("assessments", ["assessedCount"]),
    ...mapGetters("filters", ["totalProposals"]),
    myAssessmentsLink() {
      return `My Assessments (${this.assessedCount}/${this.totalProposals})`;
    },
    secsToAssess() {
      return this.assessStartsUTC.unix() - this.now;
    },
    secsToEndAssess() {
      return this.assessEndsUTC.unix() - this.now;
    },
    toEndAssess() {
      return this.getDuration(this.secsToEndAssess);
    },
    walletApi() {
      return this.$store.state.wallet.walletApi;
    },
  },
  methods: {
    selectFund(fundHash) {
      const fund = this.$store.state.funds.fundsList.find(fund => fund.json.fundHash === fundHash);
      if (fund) {
        this.$store.commit("funds/setSelectedFund", fund);
      }
    },
    getNow() {
      this.now = this.$dayjs()
        .utc()
        .unix();
    },
    getDuration(time) {
      let duration = this.$dayjs.duration(time, "seconds");
      return {
        d: duration.days(),
        h: duration.hours(),
        m: duration.minutes(),
        s: duration.seconds(),
      };
    },
    next() {
      this.$store.dispatch("filters/getNext", false);
    },
  },
  watch: {
    async walletApi(walletApi) {
      if (walletApi) {
        const usedAddresses = await walletApi.getUsedAddresses();
        if (usedAddresses.length > 0) {
          const addressBech32 = Address.from_bytes(Buffer.from(usedAddresses[0], "hex")).to_bech32();
          const stakeAddress = extractStakeAddress(
            addressBech32,
            parseInt(process.env.VUE_APP_CARDANO_NETWORK_ID, 10),
          );
          this.$store.commit("wallet/setWalletStakeAddressBech32", stakeAddress);
        }
      }
    },
  },
  mounted() {
    this.$store.dispatch("funds/loadFunds");
    setTimeout(() => {
      this.$store.dispatch("wallet/findAvailableWallets");
      this.$store.dispatch("wallet/reconnectWallet");
    }, 200);
    if (window.localStorage) {
      let oldKeys = ["ca-tool-default", "ca-tool-f8-default", "ca-tool-f9-default"];
      oldKeys.forEach(k => {
        let oldKey = window.localStorage.getItem(k);
        if (oldKey) {
          window.localStorage.removeItem(k);
        }
      });
    }
    this.interval = setInterval(() => {
      this.getNow();
    }, 1000);
  },
};
</script>

<style lang="scss">
@import "./assets/sass/base/mixins";
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
.aim-logo {
  width: 150px;
}
</style>
