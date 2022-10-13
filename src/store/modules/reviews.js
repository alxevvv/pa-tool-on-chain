import dayjs from "dayjs";
// import { fundsList } from "../../cardanoDB/fundsList";

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
};

// actions
const actions = {};

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
