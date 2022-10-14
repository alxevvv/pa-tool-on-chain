import dayjs from "dayjs";
import { txsOutputsList } from "@/cardanoDB/txsOutputsList";
import { reviewsSubmissionList } from "@/cardanoDB/reviewsSubmissionList";
import { reviewsPublicationList } from "@/cardanoDB/reviewsPublicationList";

// initial state
const getDefaultState = () => ({
  all: [],
  assessmentsReviewSubmitted: [],
  assessmentsReviewPublished: [],
});

const state = getDefaultState();

// utils
function getReviewAssessmentId(review) {
  return `${review.proposalId}.${review.assessmentPublicationTxId}`;
}

function defaultReview(id) {
  const [proposalId, assessmentPublicationTxId] = id.split(".");
  return {
    proposalId,
    assessmentPublicationTxId,
    updatedAt: 0,
    categorization: null,
    feedback: "",
  };
}

// getters
const getters = {
  reviewedCount: state => {
    return state.all.length;
  },

  reviewByAssessmentId: state => assessmentId => {
    return state.all.find(review => getReviewAssessmentId(review) === assessmentId);
  },

  reviewIndexByAssessmentId: state => assessmentId => {
    return state.all.findIndex(review => getReviewAssessmentId(review) === assessmentId);
  },

  isSubmitted: state => assessmentId => {
    return state.assessmentsReviewSubmitted.includes(assessmentId);
  },

  isPublished: state => assessmentId => {
    return state.assessmentsReviewPublished.includes(assessmentId);
  },
};

// actions
const actions = {
  async loadSubmitted(context) {
    const walletStakeAddress = context.rootState.wallet.walletStakeAddressBech32;
    if (!walletStakeAddress) {
      throw new Error("Wallet stake address missed");
    }

    if (!context.rootState.funds.selectedFund) {
      throw new Error("Fund is not selected");
    }

    const fundHash = context.rootState.funds.selectedFund.json.fundHash;

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

    const reviewedAndSubmittedAssessmentsIds = myReviewsSubmissions.reduce((acc, cur) => {
      return acc.concat(cur.json.assessmentsId);
    }, []);

    context.commit("addAssessmentsReviewSubmitted", reviewedAndSubmittedAssessmentsIds);
  },

  async loadPublished(context) {
    const walletStakeAddress = context.rootState.wallet.walletStakeAddressBech32;
    if (!walletStakeAddress) {
      throw new Error("Wallet stake address missed");
    }

    if (!context.rootState.funds.selectedFund) {
      throw new Error("Fund is not selected");
    }

    const fundHash = context.rootState.funds.selectedFund.json.fundHash;

    const reviewsPublications = await reviewsPublicationList(fundHash);
    const reviewsPublicationsTxsId = reviewsPublications.map(({ tx_id }) => tx_id);

    const txsOutputs = await txsOutputsList(reviewsPublicationsTxsId);
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

    const myReviewsPublications = reviewsPublications.filter(({ tx_id }) => {
      return myTxIds.includes(tx_id);
    });

    const reviewedAndSubmittedProposalIds = myReviewsPublications.reduce((acc, cur) => {
      return acc.concat(cur.json.assessmentsId);
    }, []);

    context.commit("addAssessmentsReviewPublished", reviewedAndSubmittedProposalIds);
  },
};

// mutations
const mutations = {
  createReview(state, assessmentId) {
    const review = defaultReview(assessmentId);
    state.all.push(review);
  },

  deleteReview(state, assessmentId) {
    const reviewIndex = getters.reviewIndexByAssessmentId(state)(assessmentId);
    if (reviewIndex !== -1) {
      state.all.splice(reviewIndex, 1);
    }
  },

  setReviewCategorization(state, { assessmentId, categorization = 0 }) {
    const review = getters.reviewByAssessmentId(state)(assessmentId);
    if (review) {
      review.categorization = categorization;
      review.updatedAt = dayjs().unix();
    }
  },

  setReviewFeedback(state, { assessmentId, feedback = "" }) {
    const review = getters.reviewByAssessmentId(state)(assessmentId);
    if (review) {
      review.feedback = feedback;
      review.updatedAt = dayjs().unix();
    }
  },

  addAssessmentsReviewSubmitted(state, assessmentsReviewSubmitted) {
    state.assessmentsReviewSubmitted = Array.from(
      new Set(state.assessmentsReviewSubmitted.concat(assessmentsReviewSubmitted)),
    );
  },

  clearAssessmentsReviewSubmitted(state) {
    state.assessmentsReviewSubmitted = [];
  },

  addAssessmentsReviewPublished(state, assessmentsReviewPublished) {
    state.assessmentsReviewPublished = Array.from(
      new Set((state.assessmentsReviewPublished || []).concat(assessmentsReviewPublished)),
    );
  },

  clearAssessmentsReviewPublished(state) {
    state.assessmentsReviewPublished = [];
  },

  resetState(state) {
    Object.assign(state, getDefaultState());
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
