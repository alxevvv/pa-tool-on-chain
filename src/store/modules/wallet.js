import {
  Address,
  AuxiliaryData,
  BigNum,
  ByronAddress,
  GeneralTransactionMetadata,
  TransactionUnspentOutput,
  TransactionUnspentOutputs,
  TransactionOutput,
  Value,
  Transaction,
  TransactionWitnessSet,
  encode_json_str_to_metadatum,
} from "@emurgo/cardano-serialization-lib-asmjs";
import { NotificationProgrammatic as Notification } from "buefy";
import initTxBuilder from "@/utils/initTxBuilder";

// initial state
const getDefaultState = () => ({
  compatibleWallets: ["eternl", "flint", "gerowallet", "nami", "nufi"],
  availableWallets: null,
  walletName: null,
  walletIcon: null,
  walletApiVersion: null,
  walletApi: null,
  walletStakeAddressBech32: null,
  isConnecting: false,
  isSendingTx: false,
});

const state = getDefaultState();

// getters
const getters = {
  async utxos(state) {
    if (!state.walletApi) {
      return null;
    }
    const utxos = [];
    try {
      const rawUtxos = await state.walletApi.getUtxos();
      for (const rawUtxo of rawUtxos) {
        const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(rawUtxo, "hex"));
        const input = utxo.input();
        const txid = Buffer.from(input.transaction_id().to_bytes(), "utf8").toString("hex");
        const txindx = input.index();
        const output = utxo.output();
        const amount = output
          .amount()
          .coin()
          .to_str(); // ADA amount in lovelace
        const multiasset = output.amount().multiasset();
        let multiAssetStr = "";

        if (multiasset) {
          const keys = multiasset.keys(); // policy Ids of thee multiasset
          const N = keys.len();
          // console.log(`${N} Multiassets in the UTXO`)
          for (let i = 0; i < N; i++) {
            const policyId = keys.get(i);
            const policyIdHex = Buffer.from(policyId.to_bytes(), "utf8").toString("hex");
            // console.log(`policyId: ${policyIdHex}`)
            const assets = multiasset.get(policyId);
            const assetNames = assets.keys();
            const K = assetNames.len();
            // console.log(`${K} Assets in the Multiasset`)

            for (let j = 0; j < K; j++) {
              const assetName = assetNames.get(j);
              const assetNameString = Buffer.from(assetName.name(), "utf8").toString();
              const assetNameHex = Buffer.from(assetName.name(), "utf8").toString("hex");
              const multiassetAmt = multiasset.get_asset(policyId, assetName);
              multiAssetStr += `+ ${multiassetAmt.to_str()} + ${policyIdHex}.${assetNameHex} (${assetNameString})`;
              // console.log(assetNameString)
              // console.log(`Asset Name: ${assetNameHex}`)
            }
          }
        }
        const obj = {
          inputValue: input,
          txid: txid,
          txindx: txindx,
          amount: amount,
          str: `${txid} #${txindx} = ${amount}`,
          multiAssetStr: multiAssetStr,
          TransactionUnspentOutput: utxo,
        };
        utxos.push(obj);
        // console.log(`utxo: ${str}`)
      }
      return utxos;
    } catch (err) {
      console.log(err);
    }
  },
  async txUnspentOutputs(_, getters) {
    if (!state.walletApi) {
      return null;
    }

    const txOutputs = TransactionUnspentOutputs.new();
    for (const utxo of await getters.utxos) {
      txOutputs.add(utxo.TransactionUnspentOutput);
    }
    return txOutputs;
  },
  async changeAddress(state) {
    if (!state.walletApi) {
      return null;
    }
    try {
      const raw = await state.walletApi.getChangeAddress();
      const changeAddress = Address.from_bytes(Buffer.from(raw, "hex")).to_bech32();
      return changeAddress;
    } catch (err) {
      console.log(err);
    }
  },
  async recipientAddress(state) {
    if (!state.walletApi) {
      return null;
    }

    let unusedAddress = false;
    let address = false;

    try {
      const raw = await state.walletApi.getUnusedAddresses();
      unusedAddress = Address.from_bytes(Buffer.from(raw[0], "hex")).to_bech32();
    } catch (err) {
      return;
    }

    try {
      address = Address.from_bech32(unusedAddress);
    } catch (err) {
      try {
        address = ByronAddress.from_base58(unusedAddress);
      } catch (err) {
        return;
      }
    }

    return address;
  },
};

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
      walletStakeAddressBech32: null,
    });
  },
  async buildTransaction(context, { metadataKey, metadataValue }) {
    try {
      // init builder
      const txBuilder = initTxBuilder();

      // metadata
      const generalMetadata = GeneralTransactionMetadata.new();
      const auxData = AuxiliaryData.new();
      generalMetadata.insert(
        BigNum.from_str(metadataKey),
        encode_json_str_to_metadatum(JSON.stringify(metadataValue)),
      );
      auxData.set_metadata(generalMetadata);
      txBuilder.set_auxiliary_data(auxData);

      // outputs
      txBuilder.add_output(
        TransactionOutput.new(
          await context.getters.recipientAddress,
          Value.new(BigNum.from_str((1e6).toString())),
        ),
      );

      // inputs
      const txUnspentOutputs = await context.getters.txUnspentOutputs;
      txBuilder.add_inputs_from(txUnspentOutputs, 0);

      // change
      txBuilder.add_change_if_needed(Address.from_bech32(await context.getters.changeAddress));

      // build tx
      const txBody = txBuilder.build();
      const transactionWitnessSet = TransactionWitnessSet.new();
      const tx = Transaction.new(
        txBody,
        TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
        auxData,
      );

      // witnesses
      let txVkeyWitnesses = await context.state.walletApi.signTx(
        Buffer.from(tx.to_bytes(), "utf8").toString("hex"),
        true,
      );
      txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));
      transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

      // get signed transaction
      const signedTx = Transaction.new(tx.body(), transactionWitnessSet, tx.auxiliary_data());

      // return transaction CBOR
      return Buffer.from(signedTx.to_bytes(), "utf8").toString("hex");
    } catch (err) {
      console.log(err);
    }
  },
  async sendTxMetadata(context, { metadataKey, metadataValue }) {
    context.commit("setIsSendingTx", true);
    try {
      const submittedTxHash = await context.state.walletApi.submitTx(
        await context.dispatch("buildTransaction", { metadataKey, metadataValue }),
      );
      return submittedTxHash;
    } finally {
      context.commit("setIsSendingTx", false);
    }
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
    state.isConnecting = false;
  },
  setWalletStakeAddressBech32(state, stakeAddress) {
    state.walletStakeAddressBech32 = stakeAddress;
  },
  setIsConnecting(state, isConnecting) {
    state.isConnecting = isConnecting;
  },
  setIsSendingTx(state, isSendingTx) {
    state.isSendingTx = isSendingTx;
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
