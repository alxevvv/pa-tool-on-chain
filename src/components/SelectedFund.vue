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
              <h3 class="title is-3">{{ fund.json.title }}</h3>
              <strong>PA Status:</strong>&nbsp;
              <b-tag :type="registrationTx ? 'is-success' : 'is-danger'" size="is-middle">{{
                registeredMessage
              }}</b-tag
              ><br />
              <strong v-if="registrationTx">PA Registration Tx Hash:</strong>
              <code v-if="registrationTx">{{ registrationTx.tx.hash.slice(2) }}</code
              ><br /><br />
              <strong>Fund Hash:</strong> <code>{{ fund.json.fundHash }}</code
              ><br />
              <strong>Fund Genesis Tx Hash:</strong> <code>{{ fund.tx.hash.slice(2) }}</code>
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
      registrationTx: null,
    };
  },

  computed: {
    fund() {
      return this.$store.state.funds.selectedFund;
    },

    registerPAIsDisabled() {
      return !this.$store.state.wallet.walletApi || !!this.registrationTx;
    },

    registeredMessage() {
      return this.registrationTx
        ? `Registered at ${this.$dayjs(this.registrationTx.tx.block.time).format("DD.MM.YYYY, HH:mm")}`
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
          const myTxIds = txsOutputs
            .filter(output => output.stake_address.view === walletStakeAddressBech32)
            .map(({ tx_id }) => tx_id);
          const myRegistration = registrations.find(registration => myTxIds.includes(registration.tx_id));
          this.registrationTx = myRegistration;
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
      await this.checkIsRegisteredAsPA();
    },
  },

  async mounted() {
    await this.checkIsRegisteredAsPA();
  },
};
</script>
