<template>
  <div class="selected-fund">
    <div class="columns is-multiline" v-if="fund">
      <div class="column is-12">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">
              Selected Fund:
            </p>
          </header>
          <div class="card-content">
            <div class="content">
              <strong>Title:</strong> {{ fund.title }}<br />
              <strong>Fund Hash:</strong> {{ fund.fundHash }}
            </div>
          </div>
          <footer class="card-footer is-justify-content-end">
            <b-button type="is-ghost" @click="showFundGenesisModal">Show genesis JSON</b-button>
            <b-button type="is-ghost" :disabled="registerPAIsDisabled" @click="registerPA"
              >Register as PA</b-button
            >
          </footer>
        </div>
      </div>
    </div>
    <div class="columns" v-else>
      <div class="column is-12">
        Please select a fund
      </div>
    </div>
  </div>
</template>

<script>
import {
  Address,
  ByronAddress,
  TransactionUnspentOutput,
  TransactionUnspentOutputs,
  TransactionOutput,
  Value,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  // TransactionInput,
  // TransactionHash,
  LinearFee,
  BigNum,
  TransactionWitnessSet,
  Transaction,
  encode_json_str_to_metadatum,
  GeneralTransactionMetadata,
  AuxiliaryData,
} from "@emurgo/cardano-serialization-lib-asmjs";
import FundGenesisModal from "@/components/FundGenesisModal";

export default {
  data() {
    return {
      utxos: null,
      changeAddress: null,
      recipientAddress: null,
      submittedTxHash: null,
    };
  },

  computed: {
    fund() {
      return this.$store.state.funds.selectedFund;
    },

    protocolParams() {
      return this.$store.state.wallet.protocolParams;
    },

    walletApi() {
      return this.$store.state.wallet.walletApi;
    },

    registerPAIsDisabled() {
      return !this.walletApi;
    },
  },

  methods: {
    showFundGenesisModal() {
      this.$buefy.modal.open({
        parent: this,
        component: FundGenesisModal,
        hasModalCard: true,
      });
    },

    initTransactionBuilder() {
      const txBuilder = TransactionBuilder.new(
        TransactionBuilderConfigBuilder.new()
          .fee_algo(
            LinearFee.new(
              BigNum.from_str(this.protocolParams.linearFee.minFeeA),
              BigNum.from_str(this.protocolParams.linearFee.minFeeB),
            ),
          )
          .pool_deposit(BigNum.from_str(this.protocolParams.poolDeposit))
          .key_deposit(BigNum.from_str(this.protocolParams.keyDeposit))
          .coins_per_utxo_word(BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
          .max_value_size(this.protocolParams.maxValSize)
          .max_tx_size(this.protocolParams.maxTxSize)
          .prefer_pure_change(true)
          .build(),
      );
      return txBuilder;
    },

    async getUtxos() {
      let Utxos = [];
      try {
        const rawUtxos = await this.walletApi.getUtxos();
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
          Utxos.push(obj);
          // console.log(`utxo: ${str}`)
        }
        return Utxos;
      } catch (err) {
        console.log(err);
      }
    },

    async getChangeAddress() {
      try {
        const raw = await this.walletApi.getChangeAddress();
        const changeAddress = Address.from_bytes(Buffer.from(raw, "hex")).to_bech32();
        return changeAddress;
      } catch (err) {
        console.log(err);
      }
    },

    async getRecipientAddress() {
      let unusedAddress = false;
      let address = false;

      try {
        const raw = await this.walletApi.getUnusedAddresses();
        unusedAddress = Address.from_bytes(Buffer.from(raw[0], "hex")).to_bech32();
      } catch (err) {
        return;
      }

      // console.log({ unusedAddress });

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

      // try {
      //   return Address.from_bech32(address);
      // } catch (err) {
      //   return ByronAddress.from_base58(address).to_address();
      // }
    },

    async getTxUnspentOutputs(utxos) {
      let txOutputs = TransactionUnspentOutputs.new();
      for (const utxo of utxos) {
        txOutputs.add(utxo.TransactionUnspentOutput);
      }
      return txOutputs;
    },

    async buildSendADATransaction(metadata) {
      try {
        const txBuilder = this.initTransactionBuilder();
        const shelleyChangeAddress = Address.from_bech32(this.changeAddress);
        let aux_data = false;
        if (metadata) {
          const generalMetadata = GeneralTransactionMetadata.new();
          aux_data = AuxiliaryData.new();
          generalMetadata.insert(
            BigNum.from_str(process.env.VUE_APP_METADATA_KEY),
            encode_json_str_to_metadatum(JSON.stringify(metadata)),
          );
          //const encodedMetadata = encode_json_str_to_metadatum(JSON.stringify(metadata), MetadataJsonSchema.NoConversions);
          aux_data.set_metadata(generalMetadata);
          txBuilder.set_auxiliary_data(aux_data);
        }

        txBuilder.add_output(
          TransactionOutput.new(this.recipientAddress, Value.new(BigNum.from_str((1e6).toString()))),
        );

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs(this.utxos);
        /*
          this.utxos.forEach((utxo, i) => {
            if (i !== 4) {
              txBuilder.add_input(
                shelleyChangeAddress,
                TransactionInput.new(
                  TransactionHash.from_bytes(
                    Buffer.from(utxo.txid, "hex")
                  ),
                  utxo.txindx
                ),
                Value.new(BigNum.from_str(utxo.amount))
              )
            }
          })
          */
        txBuilder.add_inputs_from(txUnspentOutputs, 0);

        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress);

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        const tx = Transaction.new(
          txBody,
          TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
          aux_data,
        );

        let txVkeyWitnesses = await this.walletApi.signTx(
          Buffer.from(tx.to_bytes(), "utf8").toString("hex"),
          true,
        );

        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(tx.body(), transactionWitnessSet, tx.auxiliary_data());

        const submittedTxHash = await this.walletApi.submitTx(
          Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"),
        );
        return submittedTxHash;
        // console.log(submittedTxHash);
      } catch (err) {
        this.error = err;
        console.log(err);
      }
    },

    async registerPA() {
      // const unusedAddresses = await this.walletApi.getUnusedAddresses();
      // if (unusedAddresses.length > 0) {
      //   const addressBech32 = Address.from_bytes(Buffer.from(unusedAddresses[0], "hex")).to_bech32();
      //   console.log(addressBech32);
      // }
      // alert("register PA");

      console.log("start sending test transaction");

      this.utxos = await this.getUtxos();
      console.log(this.utxos);

      this.changeAddress = await this.getChangeAddress();
      console.log(this.changeAddress);

      this.recipientAddress = await this.getRecipientAddress();
      console.log(this.recipientAddress);

      this.submittedTxHash = await this.buildSendADATransaction({
        action: "registerPA",
        fundHash: this.fund.fundHash,
      });
      console.log(`sending test transaction finished, txHash = ${this.submittedTxHash}`);
    },
  },

  mounted() {},
};
</script>
