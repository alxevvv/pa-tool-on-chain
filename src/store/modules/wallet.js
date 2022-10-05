// import {
// Address,
// ByronAddress,
// TransactionUnspentOutput,
// TransactionUnspentOutputs,
// TransactionOutput,
// Value,
// TransactionBuilder,
// TransactionBuilderConfigBuilder,
// TransactionInput,
// TransactionHash,
// LinearFee,
// BigNum,
// TransactionWitnessSet,
// Transaction,
// encode_json_str_to_metadatum,
// GeneralTransactionMetadata,
// AuxiliaryData,
// } from "@emurgo/cardano-serialization-lib-asmjs";
import { NotificationProgrammatic as Notification } from "buefy";

// initial state
const getDefaultState = () => ({
  compatibleWallets: ["eternl", "flint", "gerowallet", "nami", "nufi"],
  availableWallets: null,
  protocolParams: {
    linearFee: {
      minFeeA: "44",
      minFeeB: "155381",
    },
    minUtxo: "34482",
    poolDeposit: "500000000",
    keyDeposit: "2000000",
    maxValSize: 5000,
    maxTxSize: 16384,
    priceMem: 0.0577,
    priceStep: 0.0000721,
    coinsPerUtxoWord: "34482",
  },
  walletName: null,
  walletIcon: null,
  walletApiVersion: null,
  walletApi: null,
  walletStakeAddress: null,
  isConnecting: false,
});

const state = getDefaultState();

// getters
const getters = {};

// actions
const actions = {
  findAvailableWallets(context) {
    const availableWallets = window.cardano
      ? Object.keys(window.cardano).filter(walletName => context.state.compatibleWallets.includes(walletName))
      : [];
    context.commit("setAvailableWallets", availableWallets);
  },
  connectWallet(context, walletName) {
    if (window.cardano && window.cardano[walletName]) {
      context.commit("setIsConnecting", true);
      window.cardano[walletName]
        .enable()
        .then(walletApi => {
          if (walletApi) {
            context.commit("setConnectedWallet", {
              walletName,
              walletIcon: window.cardano[walletName].icon,
              walletApiVersion: window.cardano[walletName].apiVersion,
              walletApi,
            });
          }
        })
        .catch(error => {
          Notification.open({
            duration: 5000,
            position: "is-top",
            type: "is-danger",
            message: `Could not connect the wallet - ${error.toString()}`,
          });
          context.commit("setIsConnecting", false);
        });
    }
  },
  reconnectWallet(context) {
    if (window.cardano) {
      context.state.availableWallets.forEach(walletName => {
        window.cardano[walletName].isEnabled().then(response => {
          if (response) {
            context.commit("setIsConnecting", true);
            window.cardano[walletName]
              .enable()
              .then(walletApi => {
                if (walletApi) {
                  context.commit("setConnectedWallet", {
                    walletName,
                    walletIcon: window.cardano[walletName].icon,
                    walletApiVersion: window.cardano[walletName].apiVersion,
                    walletApi,
                  });
                }
              })
              .catch(() => {
                context.commit("setIsConnecting", false);
              });
          }
        });
      });
    }
  },
  disconnectWallet(context) {
    context.commit("setConnectedWallet", {
      walletName: null,
      walletIcon: null,
      walletApiVersion: null,
      walletApi: null,
    });
  },
};

// mutations
const mutations = {
  setAvailableWallets(state, availableWallets) {
    state.availableWallets = availableWallets;
  },
  async setConnectedWallet(state, { walletName, walletIcon, walletApiVersion, walletApi }) {
    state.walletName = walletName;
    state.walletIcon = walletIcon;
    state.walletApiVersion = walletApiVersion;
    state.walletApi = walletApi;
    // const unusedAddresses = await walletApi.getUnusedAddresses();
    // console.log(unusedAddresses);
    // if (unusedAddresses.length > 0) {
    //   const addressBech32 = Address.from_bytes(Buffer.from(unusedAddresses[0], "hex")).to_bech32();
    //   console.log(addressBech32);
    //   // state.walletStakeAddress = addressBech32;
    // }
    state.isConnecting = false;
  },
  setIsConnecting(state, isConnecting) {
    state.isConnecting = isConnecting;
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
