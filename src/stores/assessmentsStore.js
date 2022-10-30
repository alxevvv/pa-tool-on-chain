import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAssessmentsStore = defineStore(
  "assessments",
  () => {
    const all = ref([]);

    function createAssessment(proposalId) {
      return {
        proposalId,
        rate1: 0,
        note1: "",
        rate2: 0,
        note2: "",
        rate3: 0,
        note3: "",
        lastUpdate: 0,
      };
    }

    const count = computed(() => all.value.length);

    function getByProposalId(proposalId) {
      return all.value.find((assessment) => assessment.proposalId === proposalId);
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
      count,

      getByProposalId,
      add,
      set,
      remove,
      clearAll,
    };
  },
  { persist: true },
);
