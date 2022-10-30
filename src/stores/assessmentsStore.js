import { defineStore } from "pinia";
import { ref } from "vue";

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

    function getByProposalId(proposalId) {
      return all.value.find((assessment) => assessment.proposalId === proposalId);
    }

    function add(proposalId) {
      const assessment = createAssessment(proposalId);
      all.value.push(assessment);
    }

    function touch(proposalId) {
      const assessment = getByProposalId(proposalId);
      if (assessment) {
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

      getByProposalId,
      add,
      touch,
      remove,
      clearAll,
    };
  },
  { persist: true },
);
