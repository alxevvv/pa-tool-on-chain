import Vue from "vue";
import Vuex from "vuex";
import createPersist from "vuex-localstorage";
import filters from "./modules/filters";
import funds from "./modules/funds";
import assessments from "./modules/assessments";
import reviews from "./modules/reviews";
import wallet from "./modules/wallet";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

let localStorage = createPersist({
  namespace: "pa-tool-on-chain",
  initialState: {},
  paths: ["filters", "funds", "assessments", "reviews"],
  expires: 90 * 24 * 60 * 60 * 1e3, // 90 days
});

export default new Vuex.Store({
  modules: {
    filters,
    funds,
    assessments,
    reviews,
    wallet,
  },
  strict: debug,
  plugins: [localStorage],
});
