import { getFunds } from "../../graphql/queries/funds";

// initial state
const getDefaultState = () => ({
  all: [],
  isLoading: false,
});

const state = getDefaultState();

// getters
const getters = {};

// actions
const actions = {
  async loadFunds(context) {
    context.commit("setIsLoading", true);
    context.commit("setFunds", await getFunds());
    context.commit("setIsLoading", false);
  },
};

// mutations
const mutations = {
  setFunds(state, funds) {
    state.all = funds;
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
