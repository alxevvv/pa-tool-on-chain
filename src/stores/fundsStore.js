import { defineStore, storeToRefs } from "pinia";
import { computed, readonly, ref, watch } from "vue";
import { fundsList, paRegistrationsList } from "@/blockchain/dbRequests";
import { fundFromBlockchain, paRegistrationFromBlockchain } from "@/blockchain/converters";
import useRequest from "@/composables/useRequest";
import {
  assessmentCreationIsOpened,
  fundPaRegistrationIsOpened,
  fundQaStageIsDisabled,
} from "@/utils/fundsUtils";
import { useWalletStore } from "./walletStore";

export const useFundsStore = defineStore(
  "funds",
  () => {
    const walletStore = useWalletStore();
    const { walletProps } = storeToRefs(walletStore);

    const all = ref([]);
    const selectedFundHash = ref("");
    const paRegistrations = ref([]);

    const loadFundsRequest = ref(null);
    const loadPaRegistrationsRequest = ref(null);

    const selectable = computed(() => {
      return all.value.reduce((selectableFunds, fund) => {
        if (fund.currentStages.length) {
          selectableFunds.push({
            title: fund.title,
            hash: fund.fundHash,
          });
        }
        return selectableFunds;
      }, []);
    });

    const selectedFund = computed(() => {
      if (selectedFundHash.value) {
        return getByHash(selectedFundHash.value);
      } else {
        return null;
      }
    });

    const qaDisabledFundHashes = computed(() => {
      return all.value.reduce((hashes, fund) => {
        if (fundQaStageIsDisabled(fund)) {
          hashes.push(fund.fundHash);
        }
        return hashes;
      }, []);
    });

    const openedForPaRegistrationFundHashes = computed(() => {
      return all.value.reduce((hashes, fund) => {
        if (fundPaRegistrationIsOpened(fund)) {
          hashes.push(fund.fundHash);
        }
        return hashes;
      }, []);
    });

    const isOpenedForRegistration = computed(() => {
      return openedForPaRegistrationFundHashes.value.includes(selectedFundHash.value);
    });

    const paRegisteredFundHashes = computed(() => {
      return paRegistrations.value.map(({ fundHash }) => fundHash);
    });

    const isPaRegistered = computed(() => {
      return paRegisteredFundHashes.value.includes(selectedFundHash.value);
    });

    const openedForAssessmentCreationFundHashes = computed(() => {
      return all.value.reduce((hashes, fund) => {
        if (assessmentCreationIsOpened(fund)) {
          hashes.push(fund.fundHash);
        }
        return hashes;
      }, []);
    });

    const isOpenedForAssessmentCreation = computed(() => {
      return openedForAssessmentCreationFundHashes.value.includes(selectedFundHash.value);
    });

    function loadFunds() {
      loadFundsRequest.value = useRequest(fundsList, {
        onSuccess: (data) => (all.value = data.map(fundFromBlockchain)),
      });
    }

    function loadPaRegistrations(fundHash, stakeAddress) {
      if (fundHash && stakeAddress) {
        loadPaRegistrationsRequest.value?.remove();
        loadPaRegistrationsRequest.value = useRequest(paRegistrationsList, {
          requestArguments: [fundHash, stakeAddress],
          onSuccess: (data) => (paRegistrations.value = data.map(paRegistrationFromBlockchain)),
        });
      } else {
        paRegistrations.value = [];
        loadPaRegistrationsRequest.value?.remove();
      }
    }

    function getByHash(hash) {
      return all.value.find(({ fundHash }) => fundHash === hash);
    }

    watch(
      () => [selectedFundHash.value, walletProps.value?.stakeAddress],
      ([fundHash, stakeAddress]) => loadPaRegistrations(fundHash, stakeAddress),
    );

    return {
      all: readonly(all),
      loadFundsRequest: readonly(loadFundsRequest),
      loadPaRegistrationsRequest: readonly(loadPaRegistrationsRequest),
      selectedFundHash,

      selectable,
      selectedFund,
      qaDisabledFundHashes,
      openedForPaRegistrationFundHashes,
      isOpenedForRegistration,
      paRegisteredFundHashes,
      isPaRegistered,
      openedForAssessmentCreationFundHashes,
      isOpenedForAssessmentCreation,

      loadFunds,
      getByHash,
    };
  },
  {
    persist: {
      paths: ["selectedFundHash"],
    },
  },
);
