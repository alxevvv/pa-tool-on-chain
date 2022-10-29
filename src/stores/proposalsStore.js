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
      fundHash: "",
      challenges: [],
      title: "",
      tags: [],
      minPrice: 0,
      maxPrice: 0,
    });

    const filteredProposals = computed(() => {
      let proposals = all.value;

      if (filters.challenges.length > 0) {
        const challengeIds = filters.challenges.map(({ id }) => id);
        proposals = proposals.filter(({ category }) => challengeIds.includes(category));
      }

      if (filters.tags.length > 0) {
        proposals = proposals.filter(({ tags }) =>
          tags ? filters.tags.every((tag) => tags.includes(tag.id)) : false,
        );
      }

      const minPrice = filters.minPrice || 0;
      const maxPrice = filters.maxPrice || Number.MAX_SAFE_INTEGER;
      if ((minPrice > 0 || maxPrice < Number.MAX_SAFE_INTEGER) && minPrice <= maxPrice) {
        proposals = proposals.filter(
          ({ requested_funds }) => minPrice <= requested_funds && maxPrice >= requested_funds,
        );
      }

      // TODO: filter out assessed proposals

      if (filters.title.trim().length >= 3) {
        proposals = proposals.filter(({ title }) =>
          title.toLowerCase().includes(filters.title.trim().toLowerCase()),
        );
      }

      const sortedProposals = proposals.sort((a, b) =>
        a.assessmentsCount > b.assessmentsCount ? 1 : b.assessmentsCount > a.assessmentsCount ? -1 : 0,
      );

      return sortedProposals;
    });

    const isNotFiltered = computed(() => {
      return (
        filters.challenges.length === 0 &&
        filters.title === "" &&
        filters.tags.length === 0 &&
        filters.minPrice === 0 &&
        filters.maxPrice === 0
      );
    });

    function clearFilters() {
      filters.challenges = [];
      filters.title = "";
      filters.tags = [];
      filters.minPrice = 0;
      filters.maxPrice = 0;
    }

    watch(
      () => fundsStore.selectedFund,
      (fund) => {
        if (!fund || filters.fundHash !== fund.fundHash) {
          clearFilters();
        }
        if (fund) {
          filters.fundHash = fund.fundHash;
        } else {
          filters.fundHash = "";
        }
      },
    );

    /* Proposals metadata: Assessments count */

    const all = ref([]);
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

    watch(
      () => [initial.value, assessmentsCount.value],
      ([initial, assessmentsCount]) => {
        if (initial.length && assessmentsCount.length) {
          const updatedProposals = initial.map((proposal) => ({
            ...proposal,
            assessmentsCount: assessmentsCount.find(({ id }) => proposal.id === id)?.assessments_count,
          }));
          all.value = updatedProposals;
        }
      },
      { immediate: true },
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

      filters,
      filteredProposals,
      isNotFiltered,

      lastUpdate: readonly(lastUpdate),
      lastUpdateVerbose,
      lastUpdateDuration,

      assessmentsCountRequest: readonly(assessmentsCountRequest),
      lastUpdateRequest: readonly(lastUpdateRequest),

      clearFilters,
    };
  },
  {
    persist: {
      paths: ["filters"],
    },
  },
);
