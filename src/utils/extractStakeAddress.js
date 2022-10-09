import { Address, BaseAddress, RewardAddress } from "@emurgo/cardano-serialization-lib-asmjs";

function extractStakeAddress(addressBech32, networkId = 1) {
  const addr = Address.from_bech32(addressBech32);
  const baseAddr = BaseAddress.from_address(addr);
  const stakeCred = baseAddr.stake_cred();
  const rewardAddrBytes = new Uint8Array(29);
  rewardAddrBytes.set([networkId === 1 ? 0xe1 : 0xe0], 0);
  rewardAddrBytes.set(stakeCred.to_bytes().slice(4, 32), 1);
  const rewardAddr = RewardAddress.from_address(Address.from_bytes(rewardAddrBytes));
  return rewardAddr.to_address().to_bech32();
}

export default extractStakeAddress;
