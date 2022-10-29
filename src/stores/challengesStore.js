import { readonly, ref, watch } from "vue";
import { defineStore } from "pinia";
import { useFundsStore } from "./fundsStore";
import challenges from "@/assets/data/f9/categories.json";

export const useChallengesStore = defineStore(
  "challenges",
  () => {
    const fundsStore = useFundsStore();

    const all = ref([]);
    const titlesById = ref({});

    function loadChallenges(/* fundHash */) {
      all.value = challenges;
      titlesById.value = challenges.reduce((titles, challenge) => {
        titles[challenge.id] = challenge.title;
        return titles;
      }, {});
    }

    function unloadChallenges() {
      all.value = [];
      titlesById.value = {};
    }

    watch(
      () => fundsStore.selectedFund,
      (fund) => {
        if (fund) {
          loadChallenges(fund.fundHash);
        } else {
          unloadChallenges();
        }
      },
      {
        immediate: true,
      },
    );

    return {
      all: readonly(all),
      titlesById: readonly(titlesById),
    };
  },
  { persist: false },
);
