<template>
  <div>
    <h5 class="title is-5">
      Assessment Review
    </h5>
    <b-field label="Categorization">
      <b-select placeholder="Select a Criteria" v-model="categorization">
        <option
          v-for="option in categorizationOptions"
          :value="option.id"
          :key="option.id"
          :disabled="submitted"
        >
          {{ option.title }}
        </option>
      </b-select>
    </b-field>
    <b-field label="Feedback (optional)">
      <b-input type="textarea" v-model="feedback" :disabled="submitted"></b-input>
    </b-field>
    <div class="buttons">
      <b-button @click="deleteReview" icon-left="delete" type="is-danger" v-if="!submitted">
        Delete Review
      </b-button>
      <b-button
        v-else-if="ipfsCid"
        tag="a"
        type="is-info"
        target="_blank"
        :href="`https://ipfs.io/ipfs/${ipfsCid}`"
        icon-left="open-in-new"
        >Open review at IPFS</b-button
      >
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import staticProposals from "@/assets/data/f9/proposals.json";

export default {
  name: "AssessmentReview",

  props: {
    proposalId: {
      type: Number,
      required: true,
    },

    assessmentTxId: {
      type: Number,
      required: true,
    },

    ipfsCid: {
      type: String,
      required: false,
    },
  },

  data() {
    return {
      categorizationOptions: [
        { id: 1, title: "Excellent" },
        { id: 2, title: "Good" },
        { id: 3, title: "Filtered Out" },
      ],
    };
  },

  computed: {
    ...mapGetters("reviews", ["reviewByAssessmentId"]),

    assessmentId() {
      return `${this.proposalId}.${this.assessmentTxId}`;
    },

    proposal() {
      return staticProposals.find(proposal => proposal.id === this.proposalId);
    },

    review() {
      return this.reviewByAssessmentId(this.assessmentId);
    },

    submitted() {
      return this.review && this.$store.state.reviews.assessmentsReviewSubmitted.includes(this.assessmentId);
    },

    categorization: {
      get() {
        return this.review.categorization;
      },
      set(value) {
        this.$store.commit("reviews/setReviewCategorization", {
          assessmentId: this.assessmentId,
          categorization: value,
        });
      },
    },

    feedback: {
      get() {
        return this.review.feedback;
      },
      set(value) {
        this.$store.commit("reviews/setReviewFeedback", {
          assessmentId: this.assessmentId,
          feedback: value,
        });
      },
    },
  },

  methods: {
    deleteReview() {
      this.$store.commit("reviews/deleteReview", this.assessmentId);
    },
  },
};
</script>
