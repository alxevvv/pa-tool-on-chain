<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Publication info</p>
      <button type="button" class="delete" @click="$emit('close')" />
    </header>
    <section class="modal-card-body">
      <b-loading :is-full-page="false" v-model="isLoading"></b-loading>
      <div v-if="publication">
        <h4 class="title is-4">Transaction</h4>
        <strong>Submitted at:</strong> {{ $dayjs(publication.tx.block.time).format("DD.MM.YYYY, HH:mm")
        }}<br />
        <strong>Transaction Hash:</strong> <code>{{ publication.tx.hash.slice(2) }}</code
        ><br /><br />
        <h4 class="title is-4">Publication JSON</h4>
        <pre>{{ publication.json }}</pre>
      </div>
    </section>
    <footer class="modal-card-foot">
      <b-button label="OK" @click="$emit('close')" />
    </footer>
  </div>
</template>

<script>
import { assessmentsPublicationList } from "@/cardanoDB/assessmentsPublicationList";
import { txsOutputsList } from "@/cardanoDB/txsOutputsList";

export default {
  props: {
    proposalId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      isLoading: true,
      publication: null,
      fundHash: this.$store.state.funds.selectedFund.json.fundHash,
      walletStakeAddressBech32: this.$store.state.wallet.walletStakeAddressBech32,
    };
  },

  methods: {
    async loadPublication() {
      const publications = await assessmentsPublicationList(this.fundHash);
      const proposalPublications = publications.filter(publication =>
        publication.json.proposalsId?.includes(this.proposalId),
      );
      const txsIds = proposalPublications.map(({ tx_id }) => tx_id);
      const txsOutputs = await txsOutputsList(txsIds);
      const myTxIds = txsOutputs.reduce((acc, cur) => {
        if (cur.stake_address.view === this.walletStakeAddressBech32 && !acc.includes(cur.tx_id)) {
          acc.push(cur.tx_id);
        }
        return acc;
      }, []);
      const myPublication = publications.find(({ tx_id }) => myTxIds.includes(tx_id));
      if (myPublication) {
        this.publication = myPublication;
        this.isLoading = false;
      } else {
        this.$emit("close");
        this.$buefy.notification.open({
          message: "Unable to get publication information",
          type: "is-danger",
          position: "is-top",
          duration: 5000,
        });
      }
    },
  },

  mounted() {
    this.loadPublication();
  },
};
</script>
