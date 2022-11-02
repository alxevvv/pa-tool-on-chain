import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useProposalsStore } from "./proposalsStore";

export const useAssessmentsStore = defineStore(
  "assessments",
  () => {
    const proposalsStore = useProposalsStore();

    const all = ref([]);

    function createAssessment(proposalId) {
      return {
        proposalId,
        proposalTitle: proposalsStore.getById(proposalId).title,
        rate1: 0,
        note1: "",
        rate2: 0,
        note2: "",
        rate3: 0,
        note3: "",
        lastUpdate: 0,
      };
    }

    const proposalIds = computed(() => all.value.map(({ proposalId }) => proposalId));

    const count = computed(() => all.value.length);

    const countVerbose = computed(() => `${count.value}/${proposalsStore.count}`);

    function getByProposalId(proposalId) {
      return all.value.find((assessment) => assessment.proposalId === proposalId);
    }

    function has(proposalId) {
      return !!getByProposalId(proposalId);
    }

    function add(proposalId) {
      const assessment = createAssessment(proposalId);
      all.value.push(assessment);
    }

    function set(proposalId, key, value) {
      const assessment = getByProposalId(proposalId);
      if (assessment && assessment[key] !== undefined) {
        assessment[key] = value;
        assessment.lastUpdate = Date.now();
      }
    }

    function remove(proposalId) {
      const index = all.value.findIndex((assessment) => assessment.proposalId === proposalId);
      if (index !== -1) {
        all.value.splice(index, 1);
      }
    }

    function clearAll() {
      all.value = [];
    }

    return {
      all,
      proposalIds,
      count,
      countVerbose,

      getByProposalId,
      has,
      add,
      set,
      remove,
      clearAll,
    };
  },
  { persist: true },
);
