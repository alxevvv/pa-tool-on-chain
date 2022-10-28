import dayjs from "dayjs";
import { computed, reactive, readonly, ref, watch } from "vue";
import { defineStore } from "pinia";
import proposals from "@/assets/data/f9/proposals.json";
import tags from "@/assets/data/f9/tags.json";
import useRequest from "@/composables/useRequest";
import { useFundsStore } from "./fundsStore";
import { useRequestsStore } from "./requestsStore";

export const useProposalsStore = defineStore(
  "proposals",
  () => {
    const fundsStore = useFundsStore();
    const requestsStore = useRequestsStore();

    /* Lists */

    const initial = ref([]);
    const tagsList = ref([]);

    function loadProposals(/* fundHash */) {
      initial.value = proposals;
    }

    function unloadProposals() {
      initial.value = [];
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

    /* Filters */

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

    function clearFilters() {
      filters.challenges = [];
      filters.title = "";
      filters.tags = [];
      filters.minPrice = "0";
      filters.maxPrice = "0";
    }

    watch(() => fundsStore.selectedFund, clearFilters);

    /* Proposals metadata: Assessments count */

    const assessmentsCount = ref([]);
    const assessmentsCountRequest = ref(null);

    function loadAssessmentsCount() {
      assessmentsCountRequest.value = useRequest(
        () => {
          const url = `${import.meta.env.VITE_BACKEND_API_URL}/proposals.json`;
          requestsStore.sendRequest(url);
          return url;
        },
        {
          onSuccess: (data) => (assessmentsCount.value = data),
        },
      );
    }

    function unloadAssessmentsCount() {
      assessmentsCount.value = [];
    }

    const all = computed(() => {
      if (!initial.value.length) {
        return [];
      } else if (!assessmentsCount.value.length) {
        return initial.value;
      } else {
        return initial.value.map((proposal) => {
          const count = assessmentsCount.value.find(({ id }) => proposal.id === id)?.assessments_count || 0;
          return {
            ...proposal,
            assessmentsCount: count,
          };
        });
      }
    });

    watch(
      () => fundsStore.selectedFund,
      (fund) => {
        if (fund) {
          loadAssessmentsCount();
        } else {
          unloadAssessmentsCount();
          assessmentsCountRequest.value?.remove();
          assessmentsCountRequest.value = null;
        }
      },
      {
        immediate: true,
      },
    );

    /* Proposals metadata: Last update */

    const lastUpdate = ref(null);
    const lastUpdateRequest = ref(null);

    function loadLastUpdate() {
      lastUpdateRequest.value = useRequest(
        () => {
          const url = `${import.meta.env.VITE_GITHUB_BACKEND_API_URL}/commits?per_page=1`;
          requestsStore.sendRequest(url);
          return url;
        },
        {
          onSuccess: (data) => (lastUpdate.value = data[0]?.commit.author.date || null),
        },
      );
    }

    function unloadLastUpdate() {
      lastUpdate.value = null;
    }

    const lastUpdateVerbose = computed(() => {
      if (!lastUpdate.value) {
        return "";
      }
      return dayjs(lastUpdate.value).format("DD MMM YYYY HH:mm");
    });

    const lastUpdateDuration = computed(() => {
      if (!lastUpdate.value) {
        return "";
      }
      const now = dayjs().unix();
      const last = dayjs(lastUpdate.value).utc().unix();
      const diff = last - now;
      return dayjs.duration(diff, "seconds").humanize(true);
    });

    watch(
      () => fundsStore.selectedFund,
      (fund) => {
        if (fund) {
          loadLastUpdate();
        } else {
          unloadLastUpdate();
          lastUpdateRequest.value?.remove();
          lastUpdateRequest.value = null;
        }
      },
      {
        immediate: true,
      },
    );

    /*  */

    return {
      all,
      tagsList: readonly(tagsList),

      filters: filters,
      filteredProposals,

      lastUpdate: readonly(lastUpdate),
      lastUpdateVerbose,
      lastUpdateDuration,

      assessmentsCountRequest: readonly(assessmentsCountRequest),
      lastUpdateRequest: readonly(lastUpdateRequest),

      clearFilters,
    };
  },
  { persist: false },
);
