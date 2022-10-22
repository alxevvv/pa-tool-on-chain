import { defineStore } from "pinia";
import { readonly, ref } from "vue";
import { fundsList } from "@/blockchain/dbRequests";
import { fundFromBlockchain } from "@/blockchain/converters";
import useRequest from "@/composables/useRequest";
import testFundsSet from "@/assets/testData/testFundsSet.json";

export const useFundsStore = defineStore(
  "funds",
  () => {
    const all = ref([]);
    const selectedFund = ref(null);
    const loadFundsRequest = ref(null);

    function loadFunds() {
      loadFundsRequest.value = useRequest(fundsList, {
        // onSuccess: (data) => (all.value = data.map(fundFromBlockchain)),
        onSuccess: (/* data */) => (all.value = testFundsSet.map(fundFromBlockchain)),
      });
    }

    function getByHash(hash) {
      return all.value.find(({ fundHash }) => fundHash === hash);
    }

    return {
      all: readonly(all),
      selectedFund: readonly(selectedFund),
      loadFundsRequest: readonly(loadFundsRequest),

      loadFunds,
      getByHash,
    };
  },
  {
    persist: {
      paths: ["selectedFund"],
    },
  },
);
