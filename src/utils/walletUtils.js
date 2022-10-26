import {
  Address,
  AuxiliaryData,
  BaseAddress,
  BigNum,
  ByronAddress,
  GeneralTransactionMetadata,
  LinearFee,
  RewardAddress,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  TransactionUnspentOutput,
  TransactionUnspentOutputs,
  TransactionOutput,
  Value,
  Transaction,
  TransactionWitnessSet,
  encode_json_str_to_metadatum,
} from "@emurgo/cardano-serialization-lib-asmjs";
import { Buffer } from "buffer";
import { TX_METADATA_KEY } from "@/blockchain/const";

function getCardanoWalletsObject() {
  const wallets = window.cardano;
  if (wallets) {
    return wallets;
  } else {
    throw new Error("No available wallets found");
  }
}

export function getCompatibleWallets() {
  return import.meta.env.VITE_COMPATIBLE_WALLETS.split(",").map((key) => key.trim());
}

export function getAvailableWallets() {
  const compatibleWallets = getCompatibleWallets();
  return Object.keys(getCardanoWalletsObject()).filter((walletKey) => compatibleWallets.includes(walletKey));
}

export function getWalletObject(walletKey) {
  const wallets = getCardanoWalletsObject();
  if (!wallets[walletKey]) {
    throw new Error(`Wallet "${walletKey}" is not in "window" object`);
  }
  return wallets[walletKey];
}

export async function getWalletApi(walletObject) {
  return await walletObject.enable();
}

export async function getWalletUtxos(walletApi) {
  const utxos = [];
  const rawUtxos = await walletApi.getUtxos();
  for (const rawUtxo of rawUtxos) {
    const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(rawUtxo, "hex"));
    const input = utxo.input();
    const txid = Buffer.from(input.transaction_id().to_bytes(), "utf8").toString("hex");
    const txindx = input.index();
    const output = utxo.output();
    const amount = output.amount().coin().to_str(); // ADA amount in lovelace
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
          multiAssetStr += [
            `+ ${multiassetAmt.to_str()}`,
            `${policyIdHex}.${assetNameHex} (${assetNameString})`,
          ].join(" + ");
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
}

export async function getWalletRecipientAddress(walletApi) {
  let unusedAddress = false;
  let address = false;

  const raw = await walletApi.getUnusedAddresses();
  unusedAddress = Address.from_bytes(Buffer.from(raw[0], "hex")).to_bech32();

  try {
    address = Address.from_bech32(unusedAddress);
  } catch (err) {
    address = ByronAddress.from_base58(unusedAddress);
  }

  return address;
}

export async function getWalletChangeAddress(walletApi) {
  const raw = await walletApi.getChangeAddress();
  const changeAddress = Address.from_bytes(Buffer.from(raw, "hex")).to_bech32();
  return changeAddress;
}

export async function signTx(walletApi, tx, transactionWitnessSet) {
  const txCbor = Buffer.from(tx.to_bytes(), "utf8").toString("hex");
  let txVkeyWitnesses = await walletApi.signTx(txCbor, true);
  txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));
  transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());
  return Transaction.new(tx.body(), transactionWitnessSet, tx.auxiliary_data());
}

export async function submitTx(walletApi, txCbor) {
  await walletApi.submitTx(txCbor);
}

export function extractStakeAddress(addressBech32, networkId = 1) {
  const addr = Address.from_bech32(addressBech32);
  const baseAddr = BaseAddress.from_address(addr);
  const stakeCred = baseAddr.stake_cred();
  const rewardAddrBytes = new Uint8Array(29);
  rewardAddrBytes.set([networkId === 1 ? 0xe1 : 0xe0], 0);
  rewardAddrBytes.set(stakeCred.to_bytes().slice(4, 32), 1);
  const rewardAddr = RewardAddress.from_address(Address.from_bytes(rewardAddrBytes));
  return rewardAddr.to_address().to_bech32();
}

function getProtocolParams() {
  return {
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
  };
}

function initTxBuilder() {
  const protocolParams = getProtocolParams();
  return TransactionBuilder.new(
    TransactionBuilderConfigBuilder.new()
      .fee_algo(
        LinearFee.new(
          BigNum.from_str(protocolParams.linearFee.minFeeA),
          BigNum.from_str(protocolParams.linearFee.minFeeB),
        ),
      )
      .pool_deposit(BigNum.from_str(protocolParams.poolDeposit))
      .key_deposit(BigNum.from_str(protocolParams.keyDeposit))
      .coins_per_utxo_word(BigNum.from_str(protocolParams.coinsPerUtxoWord))
      .max_value_size(protocolParams.maxValSize)
      .max_tx_size(protocolParams.maxTxSize)
      .prefer_pure_change(true)
      .build(),
  );
}

function addMetadata(txBuilder, metadataKey, metadataValue) {
  const generalMetadata = GeneralTransactionMetadata.new();
  const auxData = AuxiliaryData.new();
  generalMetadata.insert(
    BigNum.from_str(metadataKey),
    encode_json_str_to_metadatum(JSON.stringify(metadataValue)),
  );
  auxData.set_metadata(generalMetadata);
  txBuilder.set_auxiliary_data(auxData);
  return auxData;
}

function addOutput(txBuilder, recipientAddress) {
  const amount = 1e6;
  const value = Value.new(BigNum.from_str(amount.toString()));
  const output = TransactionOutput.new(recipientAddress, value);
  txBuilder.add_output(output);
}

function addInputs(txBuilder, utxos, coinSelecionStrategy) {
  const txOutputs = TransactionUnspentOutputs.new();
  for (const utxo of utxos) {
    txOutputs.add(utxo.TransactionUnspentOutput);
  }
  txBuilder.add_inputs_from(txOutputs, coinSelecionStrategy);
}

function addChange(txBuilder, changeAddress) {
  txBuilder.add_change_if_needed(Address.from_bech32(changeAddress));
}

const buildTxDefaultOptions = {
  metadataKey: TX_METADATA_KEY,
  metadataValue: undefined,
  inputsCoinSelecionStrategy: 0,
};

export function buildTx(recipientAddress, changeAddress, utxos, options = {}) {
  // construct options
  const opts = {
    ...buildTxDefaultOptions,
    ...options,
  };

  let auxData = undefined;

  // init builder
  const txBuilder = initTxBuilder();

  // metadata
  if (opts.metadataValue !== undefined) {
    auxData = addMetadata(txBuilder, opts.metadataKey, opts.metadataValue);
  }

  // output
  addOutput(txBuilder, recipientAddress);

  // inputs
  addInputs(txBuilder, utxos, opts.inputsCoinSelecionStrategy);

  // change
  addChange(txBuilder, changeAddress);

  // build tx
  const txBody = txBuilder.build();
  const transactionWitnessSet = TransactionWitnessSet.new();
  const tx = Transaction.new(
    txBody,
    TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
    auxData,
  );

  return { tx, transactionWitnessSet };
}

export function getTxCbor(signedTx) {
  return Buffer.from(signedTx.to_bytes(), "utf8").toString("hex");
}
