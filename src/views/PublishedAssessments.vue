<template>
  <div class="published-assessments">
    <div class="content">
      <p class="title">
        Assessments published to the Blockchain
      </p>
    </div>
    <div class="content">
      <b-table
        :data="proposalsWithAssessments"
        detailed
        checkable
        :checked-rows.sync="checkedRows"
        :is-row-checkable="row => !!row.review && !!row.review.categorization"
      >
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
        <b-table-column label="Review submitted" v-slot="props">
          <b-tag :type="props.row.submitted ? 'is-success' : 'is-danger'">
            {{ props.row.submitted ? "Yes" : "No" }}
          </b-tag>
        </b-table-column>
        <b-table-column label="Review published" v-slot="props">
          <b-tag :type="props.row.published ? 'is-success' : 'is-danger'">
            {{ props.row.published ? "Yes" : "No" }}
          </b-tag>
        </b-table-column>
        <b-table-column label="" v-slot="props" width="100">
          <b-dropdown aria-role="list" position="is-bottom-left">
            <template #trigger="{ active }">
              <b-button
                label="Info"
                type="is-info is-light"
                size="is-small"
                :disabled="!props.row.submitted && !props.row.published"
                :icon-right="active ? 'menu-up' : 'menu-down'"
              />
            </template>
            <b-dropdown-item aria-role="listitem" :disabled="!props.row.submitted"
              >Submission</b-dropdown-item
            >
            <b-dropdown-item aria-role="listitem" :disabled="!props.row.published"
              >Publication</b-dropdown-item
            >
          </b-dropdown>
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
    <div class="content buttons">
      <b-button
        icon-left="upload"
        type="is-primary"
        :disabled="!checkedRows.length"
        :loading="$store.state.wallet.isSendingTx"
        @click="submitCheckedReviews"
        >Submit checked</b-button
      >
      <b-button
        icon-left="publish"
        type="is-primary"
        :disabled="!unpublishedReviews.length"
        :loading="$store.state.wallet.isSendingTx"
        @click="publishReviews"
        >Publish</b-button
      >
    </div>
  </div>
</template>

<script>
import sjcl from "sjcl";
import { mapGetters } from "vuex";
import staticProposals from "@/assets/data/f9/proposals.json";
import { assessmentsPublicationList } from "@/cardanoDB/assessmentsPublicationList";
import { reviewsSubmissionList } from "@/cardanoDB/reviewsSubmissionList";
import { txsOutputsList } from "@/cardanoDB/txsOutputsList";
import uploadToIPFS from "@/ipfs/addFiles";
import ProposalAssessmentRetreive from "@/components/ProposalAssessmentRetreive";
import AssessmentReview from "@/components/AssessmentReview";

export default {
  name: "PublishedAssessments",

  data() {
    return {
      assessments: [],
      checkedRows: [],
      categorizationOptions: [
        { id: 1, title: "Excellent" },
        { id: 2, title: "Good" },
        { id: 3, title: "Filtered Out" },
      ],
    };
  },

  computed: {
    ...mapGetters("reviews", ["reviewByAssessmentId", "isSubmitted", "isPublished"]),

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
          const assessmentId = `${cur.id}.${assessment.id}`;
          acc.push({
            ...cur,
            assessment,
            review: this.reviewByAssessmentId(assessmentId),
            submitted: this.isSubmitted(assessmentId),
            published: this.isPublished(assessmentId),
          });
        }
        return acc;
      }, []);
    },

    unpublishedReviews() {
      const submittedReviews = this.$store.state.reviews.assessmentsReviewSubmitted;
      const publishedReviews = this.$store.state.reviews.assessmentsReviewPublished;
      return submittedReviews.filter(proposalId => !publishedReviews.includes(proposalId));
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

    async submitCheckedReviews() {
      // filter out already submitted reviews
      const rowsToSubmit = this.checkedRows.filter(row => {
        return !this.$store.state.reviews.assessmentsReviewSubmitted.includes(
          `${row.id}.${row.assessment.id}`,
        );
      });

      // return if there are no assessments to submit
      if (!rowsToSubmit.length) {
        this.$buefy.notification.open({
          message: "All selected reviews have already been submitted",
          type: "is-warning",
          position: "is-top",
          duration: 4000,
        });
        return;
      }

      // create assessments submission array
      const submittingReviews = rowsToSubmit.map(row => {
        const assessmentId = `${row.id}.${row.assessment.id}`;
        return {
          assessmentId,
          categorization: row.review.categorization,
          feedback: row.review.feedback,
        };
      });

      // encode assessments submission array
      const submittingReviewsString = JSON.stringify(submittingReviews);
      const submittingReviewsBitArray = sjcl.hash.sha256.hash(submittingReviewsString);
      const submittingReviewsHash = sjcl.codec.hex.fromBits(submittingReviewsBitArray);
      const submittingReviewsAssessmentsId = submittingReviews.map(({ assessmentId }) => assessmentId);

      // create submission payload
      const submissionPayload = {
        action: "reviewsSubmission",
        fundHash: this.$store.state.funds.selectedFund.json.fundHash,
        hashAlg: "sha256",
        reviewsHash: submittingReviewsHash,
        assessmentsId: submittingReviewsAssessmentsId,
      };

      try {
        // send transaction
        const txSendingResult = await this.$store.dispatch("wallet/sendTxMetadata", {
          metadataKey: process.env.VUE_APP_METADATA_KEY,
          metadataValue: submissionPayload,
        });

        // uncheck table rows
        this.checkedRows = [];

        // add ids of assessed proposals
        this.$store.commit("reviews/addAssessmentsReviewSubmitted", submittingReviewsAssessmentsId);

        // show success notification
        this.$buefy.notification.open({
          message: `Transaction sent. Hash: ${txSendingResult}`,
          type: "is-success",
          position: "is-top",
          duration: 7500,
        });
      } catch (err) {
        // show notification on error
        this.$buefy.notification.open({
          message: `Transaction sending error: ${err}`,
          type: "is-danger",
          position: "is-top",
          duration: 7500,
        });
      }
    },

    async publishReviews() {
      const unpublishedReviews = this.unpublishedReviews;

      const walletStakeAddress = this.$store.state.wallet.walletStakeAddressBech32;
      const fundHash = this.$store.state.funds.selectedFund.json.fundHash;

      const reviewsSubmissions = await reviewsSubmissionList(fundHash);
      const reviewsSubmissionsTxsId = reviewsSubmissions.map(({ tx_id }) => tx_id);

      const txsOutputs = await txsOutputsList(reviewsSubmissionsTxsId);
      const myTxIds = Array.from(
        new Set(
          txsOutputs.reduce((acc, cur) => {
            if (cur.stake_address.view === walletStakeAddress) {
              acc.push(cur.tx_id);
            }
            return acc;
          }, []),
        ),
      );

      const myReviewsSubmissions = reviewsSubmissions.filter(({ tx_id }) => {
        return myTxIds.includes(tx_id);
      });

      const reviewedAndSubmittedAssessmentGroups = myReviewsSubmissions.reduce((acc, cur) => {
        if (cur.json.assessmentsId.every(id => unpublishedReviews.includes(id))) {
          acc.push(cur.json);
        }
        return acc;
      }, []);

      if (reviewedAndSubmittedAssessmentGroups.length) {
        const submitToPublish = reviewedAndSubmittedAssessmentGroups[0];
        const reviews = submitToPublish.assessmentsId.map(assessmentId => {
          const review = this.reviewByAssessmentId(assessmentId);
          return {
            assessmentId,
            categorization: review.categorization,
            feedback: review.feedback,
          };
        });

        const reviewsBlob = new Blob([JSON.stringify(reviews)], { type: "application/json" });
        const reviewsFile = new File([reviewsBlob], "reviews.json");

        const publicationCID = await uploadToIPFS([reviewsFile]);

        const publicationPayload = {
          action: "reviewsPublication",
          fundHash: submitToPublish.fundHash,
          assessmentsId: submitToPublish.assessmentsId,
          reviewsHash: submitToPublish.reviewsHash,
          reviewsCID: publicationCID,
        };

        try {
          // send transaction
          const txSendingResult = await this.$store.dispatch("wallet/sendTxMetadata", {
            metadataKey: process.env.VUE_APP_METADATA_KEY,
            metadataValue: publicationPayload,
          });

          // add ids of assessed proposals
          this.$store.commit("reviews/addAssessmentsReviewPublished", publicationPayload.assessmentsId);

          // show success notification
          this.$buefy.notification.open({
            message: `Transaction sent. Hash: ${txSendingResult}`,
            type: "is-success",
            position: "is-top",
            duration: 7500,
          });
        } catch (err) {
          // show notification on error
          this.$buefy.notification.open({
            message: `Transaction sending error: ${err}`,
            type: "is-danger",
            position: "is-top",
            duration: 7500,
          });
        }
      }
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
