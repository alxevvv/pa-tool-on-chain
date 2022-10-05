import { fundsList } from "../../cardanoDB/fundsList";

// initial state
const getDefaultState = () => ({
  fundsList: [],
  selectedFund: null,
  isLoading: false,
});

const state = getDefaultState();

// getters
const getters = {};

// actions
const actions = {
  async loadFunds(context) {
    context.commit("setIsLoading", true);
    context.commit("setFundsList", await fundsList());
    context.commit("setIsLoading", false);
  },
};

// mutations
const mutations = {
  setFundsList(state, funds) {
    state.fundsList = funds;
  },
  setSelectedFund(state, fund) {
    state.selectedFund = fund;
  },
  setIsLoading(state, isLoading) {
    state.isLoading = isLoading;
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
