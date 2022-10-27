import { reactive, readonly, ref, watch } from "vue";
import { defineStore } from "pinia";
import { useFundsStore } from "./fundsStore";
import proposals from "@/assets/data/f9/proposals.json";

export const useProposalsStore = defineStore(
  "proposals",
  () => {
    const fundsStore = useFundsStore();

    const all = ref([]);
    const filters = reactive({
      challenges: [],
      tags: [],
      minPrice: 0,
      maxPrice: Number.MAX_SAFE_INTEGER,
    });

    function loadProposals(/* fundHash */) {
      all.value = proposals;
    }

    function unloadProposals() {
      all.value = [];
    }

    watch(
      () => fundsStore.selectedFund,
      (fund) => {
        if (fund) {
          loadProposals(fund.fundHash);
        } else {
          unloadProposals();
        }
      },
      {
        immediate: true,
      },
    );

    return {
      all: readonly(all),
      filters: readonly(filters),
    };
  },
  { persist: false },
);
