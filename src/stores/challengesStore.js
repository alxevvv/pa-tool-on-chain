import { readonly, ref, watch } from "vue";
import { defineStore } from "pinia";
import { useFundsStore } from "./fundsStore";
import challenges from "@/assets/data/f9/categories.json";
import tags from "@/assets/data/f9/tags.json";

export const useChallengesStore = defineStore(
  "challenges",
  () => {
    const fundsStore = useFundsStore();

    const all = ref([]);
    const tagsList = ref([]);

    function loadChallenges(/* fundHash */) {
      all.value = challenges;
    }

    function unloadChallenges() {
      all.value = [];
    }

    function loadTags(/* fundHash */) {
      tagsList.value = tags;
    }

    function unloadTags() {
      tagsList.value = [];
    }

    watch(
      () => fundsStore.selectedFund,
      (fund) => {
        if (fund) {
          loadChallenges(fund.fundHash);
          loadTags(fund.fundHash);
        } else {
          unloadChallenges();
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
    };
  },
  { persist: false },
);
