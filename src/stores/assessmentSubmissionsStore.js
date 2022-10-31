import { ref } from "vue";
import { defineStore } from "pinia";
import { useAssessmentsStore } from "./assessmentsStore";

export const useAssessmentSubmissionsStore = defineStore(
  "assessmentSubmissions",
  () => {
    const assessmentsStore = useAssessmentsStore();

    const upcoming = ref([]);

    function upcomingAdd(proposalId) {
      if (assessmentsStore.has(proposalId)) {
        upcoming.value.push(proposalId);
      }
    }

    function upcomingRemove(proposalId) {
      const index = upcoming.value.indexOf(proposalId);
      if (index !== -1) {
        upcoming.value.splice(index, 1);
      }
    }

    function upcomingToggle(proposalId) {
      if (upcoming.value.includes(proposalId)) {
        upcomingRemove(proposalId);
      } else {
        upcomingAdd(proposalId);
      }
    }

    return {
      upcoming,

      upcomingAdd,
      upcomingRemove,
      upcomingToggle,
    };
  },
  {
    persist: {
      paths: ["upcoming"],
    },
  },
);
