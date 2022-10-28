import { computed, reactive, readonly, ref, watch } from "vue";
import { defineStore } from "pinia";
import { useFundsStore } from "./fundsStore";
import proposals from "@/assets/data/f9/proposals.json";
import tags from "@/assets/data/f9/tags.json";

export const useProposalsStore = defineStore(
  "proposals",
  () => {
    const fundsStore = useFundsStore();

    const all = ref([]);
    const tagsList = ref([]);
    const filters = reactive({
      challenges: [],
      title: "",
      tags: [],
      minPrice: "0",
      maxPrice: "0",
    });

    const filteredProposals = computed(() => {
      return all.value.slice(0, 10);
    });

    function loadProposals(/* fundHash */) {
      all.value = proposals;
    }

    function unloadProposals() {
      all.value = [];
    }

    function loadTags(/* fundHash */) {
      tagsList.value = tags;
    }

    function unloadTags() {
      tagsList.value = [];
    }

    function clearFilters() {
      filters.challenges = [];
      filters.title = "";
      filters.tags = [];
      filters.minPrice = "0";
      filters.maxPrice = "0";
    }

    watch(
      () => fundsStore.selectedFund,
      (fund) => {
        if (fund) {
          loadProposals(fund.fundHash);
          loadTags(fund.fundHash);
        } else {
          unloadProposals();
          unloadTags();
        }
      },
      {
        immediate: true,
      },
    );

    return {
      all: readonly(all),
      tagsList: readonly(tagsList),
      filters: filters,
      filteredProposals,

      clearFilters,
    };
  },
  { persist: false },
);
