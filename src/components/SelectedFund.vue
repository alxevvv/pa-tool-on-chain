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
              <strong>Title:</strong> {{ fund.title }}<br />
              <strong>Fund Hash:</strong> {{ fund.fundHash }}
            </div>
          </div>
          <footer class="card-footer is-justify-content-end">
            <b-button type="is-ghost" @click="showFundGenesisModal">Show genesis JSON</b-button>
            <b-button type="is-ghost">Register as PA</b-button>
          </footer>
        </div>
      </div>
    </div>
    <div class="columns" v-else>
      <div class="column is-12">
        Please select the fund
      </div>
    </div>
  </div>
</template>

<script>
import FundGenesisModal from "@/components/FundGenesisModal";

export default {
  computed: {
    fund() {
      return this.$store.state.funds.selectedFund;
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
  },

  mounted() {},
};
</script>
