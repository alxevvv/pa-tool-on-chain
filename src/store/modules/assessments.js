import dayjs from "dayjs";
import { txsOutputsList } from "@/cardanoDB/txsOutputsList";
import { assessmentsSubmissionList } from "@/cardanoDB/assessmentsSubmissionList";

// initial state
const getDefaultState = () => ({
  all: [],
  assessedSubmittedProposalsId: [],
});
const state = getDefaultState();

// utils
const defaultAssessment = id => {
  return {
    id: id,
    rate_1: 0,
    note_1: "",
    self_ev_1: false,
    rate_2: 0,
    note_2: "",
    self_ev_2: false,
    rate_3: 0,
    note_3: "",
    self_ev_3: false,
    last_update: 0,
    submitted: false,
  };
};

// getters
const getters = {
  indexed: state => {
    let indexed = {};
    state.all.forEach(el => {
      indexed[el.id] = el;
    });
    return indexed;
  },
  ids: (state, getters) => {
    return Object.keys(getters.indexed).map(a => parseInt(a));
  },
  getById: (state, getters) => id => {
    if (getters.indexed[id]) {
      return getters.indexed[id];
    }
    return false;
  },
  assessedCount: state => {
    return state.all.length;
  },
};

// actions
const actions = {
  async loadSubmitted(context) {
    const walletStakeAddress = context.rootState.wallet.walletStakeAddressBech32;
    if (!walletStakeAddress) {
      throw new Error("Wallet stake address missed");
    }

    const assessmentsSubmissions = await assessmentsSubmissionList();
    const assessmentsSubmissionsTxsId = assessmentsSubmissions.map(({ tx_id }) => tx_id);

    const txsOutputs = await txsOutputsList(assessmentsSubmissionsTxsId);
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

    const myAssessmentsSubmissions = assessmentsSubmissions.filter(({ tx_id }) => {
      return myTxIds.includes(tx_id);
    });

    const assessedAndSubmittedProposalIds = myAssessmentsSubmissions.reduce((acc, cur) => {
      return acc.concat(cur.json.proposalsId);
    }, []);

    context.commit("addAssessedSubmittedProposalsId", assessedAndSubmittedProposalIds);
  },
};

// mutations
const mutations = {
  setAssessments(state, assessments) {
    state.all = assessments;
  },
  addAssessedSubmittedProposalsId(state, assessedSubmittedProposalsId) {
    state.assessedSubmittedProposalsId = Array.from(
      new Set(state.assessedSubmittedProposalsId.concat(assessedSubmittedProposalsId)),
    );
  },
  addAssessment(state, proposalId) {
    let assessment = defaultAssessment(proposalId);
    state.all.push(assessment);
  },
  deleteAssessment(state, id) {
    var found = state.all.filter(assessment => assessment.id === id);
    if (found.length > 0) {
      let index = state.all.indexOf(found[0]);
      state.all.splice(index, 1);
    }
  },
  setValue(state, data) {
    let assessment = state.all.find(a => parseInt(a.id) === parseInt(data.id));
    if (assessment) {
      assessment[data.field] = data.value;
      assessment.last_update = dayjs().unix();
    }
  },
  resetState(state) {
    //state.currentIndex = 0
    //state.keyword = ''
    //state.selectedChallenges = []
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
