<template>
  <div class="modal-card" style="width: auto">
    <header class="modal-card-head">
      <p class="modal-card-title">Submission info</p>
      <button type="button" class="delete" @click="$emit('close')" />
    </header>
    <section class="modal-card-body">
      <b-loading :is-full-page="false" v-model="isLoading"></b-loading>
      <div v-if="submission">
        <h4 class="title is-4">Transaction</h4>
        <strong>Submitted at:</strong> {{ $dayjs(submission.tx.block.time).format("DD.MM.YYYY, HH:mm")
        }}<br />
        <strong>Transaction Hash:</strong> <code>{{ submission.tx.hash.slice(2) }}</code
        ><br /><br />
        <h4 class="title is-4">Submission JSON</h4>
        <pre>{{ submission.json }}</pre>
      </div>
    </section>
    <footer class="modal-card-foot">
      <b-button label="OK" @click="$emit('close')" />
    </footer>
  </div>
</template>

<script>
import { reviewsSubmissionList } from "@/cardanoDB/reviewsSubmissionList";
import { txsOutputsList } from "@/cardanoDB/txsOutputsList";

export default {
  props: {
    assessmentId: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      isLoading: true,
      submission: null,
      fundHash: this.$store.state.funds.selectedFund.json.fundHash,
      walletStakeAddressBech32: this.$store.state.wallet.walletStakeAddressBech32,
    };
  },

  methods: {
    async loadSubmission() {
      const submissions = await reviewsSubmissionList(this.fundHash);
      const assessmentSubmissions = submissions.filter(submission =>
        submission.json.assessmentsId.includes(this.assessmentId),
      );
      const txsIds = assessmentSubmissions.map(({ tx_id }) => tx_id);
      const txsOutputs = await txsOutputsList(txsIds);
      const myTxIds = txsOutputs.reduce((acc, cur) => {
        if (cur.stake_address.view === this.walletStakeAddressBech32 && !acc.includes(cur.tx_id)) {
          acc.push(cur.tx_id);
        }
        return acc;
      }, []);
      const mySubmission = submissions.find(({ tx_id }) => myTxIds.includes(tx_id));
      if (mySubmission) {
        this.submission = mySubmission;
        this.isLoading = false;
      } else {
        this.$emit("close");
        this.$buefy.notification.open({
          message: "Unable to get submission information",
          type: "is-danger",
          position: "is-top",
          duration: 5000,
        });
      }
    },
  },

  mounted() {
    this.loadSubmission();
  },
};
</script>
