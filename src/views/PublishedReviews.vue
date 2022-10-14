<template>
  <div class="published-reviews">
    <div class="content">
      <p class="title">
        Reviews published to the Blockchain
      </p>
    </div>
    <div class="content">
      <b-table :data="proposalsWithReviews" detailed>
        <b-table-column label="ID" v-slot="props">
          {{ props.row.id }}.{{ props.row.review.id }}
        </b-table-column>
        <b-table-column label="Proposal" v-slot="props">
          <router-link :to="`/proposal/${props.row.id}`">
            {{ props.row.title }}
          </router-link>
        </b-table-column>
        <b-table-column label="Published At" v-slot="props">
          {{ $dayjs(props.row.review.tx.block.time).format("DD.MM.YYYY, HH:mm") }}
        </b-table-column>
        <template #detail="props">
          Publishing Tx Hash: <code>{{ props.row.review.tx.hash.slice(2) }}</code
          ><br />
          Reviews Hash: <code>{{ props.row.review.json.reviewsHash }}</code
          ><br />
          Reviews IPFS CID: <code>{{ props.row.review.json.reviewsCID }}</code
          ><br />
          <hr />
          <assessment-review-retreive
            :assessmentId="props.row.assessmentId"
            :ipfsCid="props.row.review.json.reviewsCID"
          ></assessment-review-retreive>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import staticProposals from "@/assets/data/f9/proposals.json";
import { reviewsPublicationList } from "@/cardanoDB/reviewsPublicationList";
import AssessmentReviewRetreive from "@/components/AssessmentReviewRetreive";

export default {
  name: "PublishedReviews",

  data() {
    return {
      reviews: [],
    };
  },

  computed: {
    selectedFund() {
      return this.$store.state.funds.selectedFund;
    },

    reviewedProposalIds() {
      return Array.from(
        new Set(
          this.reviews.reduce(
            (acc, cur) => acc.concat(cur.json.assessmentsId.map(id => parseInt(id.split(".")[0]))),
            [],
          ),
        ),
      );
    },

    proposals() {
      return staticProposals.filter(({ id }) => this.reviewedProposalIds.includes(id));
    },

    proposalsWithReviews() {
      return this.proposals.reduce((acc, cur) => {
        const proposalId = cur.id;
        const proposalReviews = this.reviews.filter(review =>
          review.json.assessmentsId.map(id => parseInt(id.split(".")[0])).includes(proposalId),
        );
        for (const review of proposalReviews) {
          const assessmentTxId = review.json.assessmentsId
            .find(id => parseInt(id.split(".")[0]) === proposalId)
            .split(".")[1];
          const assessmentId = `${proposalId}.${assessmentTxId}`;
          acc.push({ ...cur, review, assessmentId });
        }
        return acc;
      }, []);
    },
  },

  methods: {
    async load() {
      const reviews = await reviewsPublicationList(this.selectedFund.json.fundHash);
      this.reviews = reviews.filter(({ json }) => !!json.assessmentsId);
    },
  },

  watch: {
    selectedFund() {
      this.load();
    },
  },

  mounted() {
    this.load();
  },

  components: {
    AssessmentReviewRetreive,
  },
};
</script>
