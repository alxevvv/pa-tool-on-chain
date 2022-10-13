<template>
  <div class="published-assessments">
    <div class="content">
      <p class="title">
        Assessments published to the Blockchain
      </p>
    </div>
    <div class="content">
      <b-table :data="proposalsWithAssessments" detailed>
        <b-table-column label="ID" v-slot="props">
          {{ props.row.id }}.{{ props.row.assessment.id }}
        </b-table-column>
        <b-table-column label="Proposal" v-slot="props">
          <router-link :to="`/proposal/${props.row.id}`">
            {{ props.row.title }}
          </router-link>
        </b-table-column>
        <b-table-column label="Published At" v-slot="props">
          {{ $dayjs(props.row.assessment.tx.block.time).format("DD.MM.YYYY, HH:mm") }}
        </b-table-column>
        <b-table-column label="Review" v-slot="props">
          <b-tag
            :type="
              props.row.review ? (props.row.review.categorization ? 'is-primary' : 'is-warning') : undefined
            "
          >
            {{
              props.row.review
                ? props.row.review.categorization
                  ? categorizationOptions.find(option => option.id === props.row.review.categorization).title
                  : "Not categorized"
                : "Not reviewed"
            }}
          </b-tag>
        </b-table-column>
        <template #detail="props">
          Publishing Tx Hash: <code>{{ props.row.assessment.tx.hash.slice(2) }}</code
          ><br />
          Assessments Hash: <code>{{ props.row.assessment.json.assessmentsHash }}</code
          ><br />
          Assessments IPFS CID: <code>{{ props.row.assessment.json.assessmentsCID }}</code
          ><br />
          <hr />
          <proposal-assessment-retreive
            :proposalId="props.row.id"
            :ipfsCid="props.row.assessment.json.assessmentsCID"
          ></proposal-assessment-retreive>
          <hr />
          <b-button
            v-if="!props.row.review"
            type="is-primary"
            icon-left="sticker-check-outline"
            @click="createReview(`${props.row.id}.${props.row.assessment.id}`)"
            >Create a Review</b-button
          >
          <assessment-review
            v-else
            :proposalId="props.row.id"
            :assessmentTxId="props.row.assessment.id"
          ></assessment-review>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import staticProposals from "@/assets/data/f9/proposals.json";
import { assessmentsPublicationList } from "@/cardanoDB/assessmentsPublicationList";
import ProposalAssessmentRetreive from "@/components/ProposalAssessmentRetreive";
import AssessmentReview from "@/components/AssessmentReview";

export default {
  name: "PublishedAssessments",

  data() {
    return {
      assessments: [],
      categorizationOptions: [
        { id: 1, title: "Excellent" },
        { id: 2, title: "Good" },
        { id: 3, title: "Filtered Out" },
      ],
    };
  },

  computed: {
    ...mapGetters("reviews", ["reviewByAssessmentId"]),

    selectedFund() {
      return this.$store.state.funds.selectedFund;
    },

    assessedProposalIds() {
      return Array.from(new Set(this.assessments.reduce((acc, cur) => acc.concat(cur.json.proposalsId), [])));
    },

    proposals() {
      return staticProposals.filter(({ id }) => this.assessedProposalIds.includes(id));
    },

    proposalsWithAssessments() {
      return this.proposals.reduce((acc, cur) => {
        const proposalId = cur.id;
        const proposalAssessments = this.assessments.filter(assessment =>
          assessment.json.proposalsId.includes(proposalId),
        );
        for (const assessment of proposalAssessments) {
          acc.push({ ...cur, assessment, review: this.reviewByAssessmentId(`${cur.id}.${assessment.id}`) });
        }
        return acc;
      }, []);
    },
  },

  methods: {
    getProposalById(id) {
      return this.proposals.find(proposal => proposal.id === id);
    },

    async load() {
      const assessments = await assessmentsPublicationList(this.selectedFund.json.fundHash);
      this.assessments = assessments.filter(({ json }) => !!json.proposalsId);
    },

    createReview(assessmentId) {
      this.$store.commit("reviews/createReview", assessmentId);
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
    ProposalAssessmentRetreive,
    AssessmentReview,
  },
};
</script>
