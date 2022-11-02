import dayjs from "dayjs";
import { computed, reactive, readonly, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { defineStore } from "pinia";
import proposals from "@/assets/data/f9/proposals.json";
import tags from "@/assets/data/f9/tags.json";
import { useFundsStore } from "./fundsStore";
import { useAssessmentsStore } from "./assessmentsStore";
import { useNotificationsStore } from "./notificationsStore";

const ENDLESS_PAGINATION_MIN_CHUNK_SIZE = 25;

export const useProposalsStore = defineStore(
  "proposals",
  () => {
    const router = useRouter();

    const fundsStore = useFundsStore();
    const assessmentsStore = useAssessmentsStore();
    const notificationsStore = useNotificationsStore();

    /* Lists */

    const all = ref([]);
    const tagsList = ref([]);

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

    function getById(proposalId) {
      return all.value.find(({ id }) => id === proposalId);
    }

    const count = computed(() => all.value.length);

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

    /* Proposals metadata: Last update */

    const lastUpdate = ref("2022-07-14T14:10:12Z");

    const lastUpdateVerbose = computed(() => {
      return dayjs(lastUpdate.value).format("DD MMM YYYY HH:mm");
    });

    const lastUpdateDuration = computed(() => {
      const now = dayjs().unix();
      const last = dayjs(lastUpdate.value).utc().unix();
      const diff = last - now;
      return dayjs.duration(diff, "seconds").humanize(true);
    });

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
      let proposals = all.value.filter(({ id }) => !assessmentsStore.proposalIds.includes(id));

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

      if (filters.title.trim().length >= 3) {
        proposals = proposals.filter(({ title }) =>
          title.toLowerCase().includes(filters.title.trim().toLowerCase()),
        );
      }

      const sortedProposals = proposals.sort((a, b) =>
        a.assessments_count > b.assessments_count ? 1 : b.assessments_count > a.assessments_count ? -1 : 0,
      );

      return sortedProposals;
    });

    const isNotFiltered = computed(() => {
      return (
        !filters.challenges.length &&
        !filters.title &&
        !filters.tags.length &&
        !filters.minPrice &&
        !filters.maxPrice
      );
    });

    function clearFilters() {
      if (!isNotFiltered.value) {
        filters.challenges = [];
        filters.title = "";
        filters.tags = [];
        filters.minPrice = 0;
        filters.maxPrice = 0;
      }
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

    watch(filters, endlessPaginationReset);

    /* Pagination */

    const lastProposalInListIndex = ref(ENDLESS_PAGINATION_MIN_CHUNK_SIZE);

    const paginatedProposals = computed(() => {
      return filteredProposals.value.slice(0, lastProposalInListIndex.value);
    });

    function endlessPaginationShowNextChunk(chunkSize = ENDLESS_PAGINATION_MIN_CHUNK_SIZE) {
      lastProposalInListIndex.value = Math.min(
        filteredProposals.value.length,
        lastProposalInListIndex.value + Math.max(chunkSize, ENDLESS_PAGINATION_MIN_CHUNK_SIZE),
      );
    }

    function endlessPaginationReset() {
      lastProposalInListIndex.value = ENDLESS_PAGINATION_MIN_CHUNK_SIZE;
    }

    /* Proposal suggesting */

    const currentIndex = ref(0);

    function suggestNext(fromFilter = false) {
      if (!fundsStore.selectedFundHash) {
        notificationsStore.add({
          text: "Please select a fund",
          type: "is-warning",
          duration: 5000,
        });
        router.push({ name: "Funds" });
      } else {
        const suggestedProposal = filteredProposals.value[currentIndex.value];
        if (suggestedProposal) {
          const newId = suggestedProposal.id.toString();
          if (router.currentRoute.value.name === "Proposal" || !fromFilter) {
            const currentId = router.currentRoute.value.params.id;
            if (newId !== currentId) {
              router.push({ name: "Proposal", params: { id: newId } });
            }
          }
          currentIndex.value += 1;
        } else {
          currentIndex.value = 0;
        }
      }
    }

    /*  */

    return {
      all,
      count,
      tagsList: readonly(tagsList),
      getById,

      lastUpdate: readonly(lastUpdate),
      lastUpdateVerbose,
      lastUpdateDuration,

      filters,
      filteredProposals,
      isNotFiltered,
      clearFilters,

      lastProposalInListIndex,
      paginatedProposals,
      endlessPaginationShowNextChunk,
      endlessPaginationReset,

      currentIndex,
      suggestNext,
    };
  },
  {
    persist: {
      paths: ["filters", "lastProposalInListIndex", "currentIndex"],
    },
  },
);
