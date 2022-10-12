<template>
  <div class="selected-fund">
    <div class="columns is-multiline" v-if="fund">
      <div class="column is-12">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">
              Selected Fund:
            </p>
          </header>
          <div class="card-content">
            <div class="content">
              <strong>Title:</strong> {{ fund.json.title }}<br />
              <strong>Fund Hash:</strong> <code>{{ fund.json.fundHash }}</code
              ><br />
              <strong>Fund Genesis Tx Hash:</strong> <code>{{ fund.tx.hash.slice(2) }}</code
              ><br />
              <strong>PA Status:</strong>
              {{ registeredMessage }}<br />
            </div>
          </div>
          <footer class="card-footer is-justify-content-end">
            <b-button type="is-ghost" @click="showFundGenesisModal">Show genesis JSON</b-button>
            <b-button
              type="is-ghost"
              :disabled="registerPAIsDisabled"
              :loading="$store.state.wallet.isSendingTx"
              @click="registerPA"
              >Register as PA</b-button
            >
          </footer>
        </div>
      </div>
    </div>
    <div class="columns" v-else>
      <div class="column is-12">
        Please select a fund
      </div>
    </div>
  </div>
</template>

<script>
import FundGenesisModal from "@/components/FundGenesisModal";
import { fundPARegistrationList } from "@/cardanoDB/fundPARegistrationList";
import { txsOutputsList } from "@/cardanoDB/txsOutputsList";

export default {
  data() {
    return {
      isRegisteredAsPA: null,
    };
  },

  computed: {
    fund() {
      return this.$store.state.funds.selectedFund;
    },

    registerPAIsDisabled() {
      return !this.$store.state.wallet.walletApi || !!this.isRegisteredAsPA;
    },

    registeredMessage() {
      return this.isRegisteredAsPA
        ? `Registered at ${this.$dayjs(this.fund.tx.block.time).format("DD.MM.YYYY, HH:mm")}`
        : "Unregistered";
    },

    fundAndWallet() {
      if (this.fund && this.$store.state.wallet.walletStakeAddressBech32) {
        return [this.fund.json.fundHash, this.$store.state.wallet.walletStakeAddressBech32];
      } else {
        return null;
      }
    },
  },

  methods: {
    showFundGenesisModal() {
      this.$buefy.modal.open({
        parent: this,
        component: FundGenesisModal,
        hasModalCard: true,
      });
    },

    async checkIsRegisteredAsPA() {
      const walletStakeAddressBech32 = this.$store.state.wallet.walletStakeAddressBech32;
      if (this.fund && walletStakeAddressBech32) {
        const registrations = await fundPARegistrationList(this.fund.json.fundHash);
        if (registrations.length) {
          const txsIds = registrations.map(({ tx_id }) => tx_id);
          const txsOutputs = await txsOutputsList(txsIds);
          const txsOutputsStakeAddresses = txsOutputs.map(({ stake_address: { view } }) => view);
          return txsOutputsStakeAddresses.includes(walletStakeAddressBech32);
        }
      }
      return false;
    },

    async registerPA() {
      const registerPAPayload = {
        action: "registerPA",
        fundHash: this.fund.json.fundHash,
      };

      const txSendingResult = await this.$store.dispatch("wallet/sendTxMetadata", {
        metadataKey: process.env.VUE_APP_METADATA_KEY,
        metadataValue: registerPAPayload,
      });

      this.$buefy.notification.open({
        message: `Transaction sent. Hash: ${txSendingResult}`,
        type: "is-success",
        position: "is-top",
        duration: 7500,
      });
    },
  },

  watch: {
    async fundAndWallet() {
      this.isRegisteredAsPA = await this.checkIsRegisteredAsPA();
    },
  },

  async mounted() {
    this.isRegisteredAsPA = await this.checkIsRegisteredAsPA();
  },
};
</script>
