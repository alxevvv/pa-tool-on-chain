import {
  BigNum,
  LinearFee,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
} from "@emurgo/cardano-serialization-lib-asmjs";

import getProtocolParams from "./getProtocolParams";

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

export default initTxBuilder;
