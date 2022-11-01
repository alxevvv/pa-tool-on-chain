import sjcl from "sjcl";
import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { BLOCKCHAIN_ACTIONS } from "@/blockchain/const";
import { assessmentsSubmissionFromBlockchain } from "@/blockchain/converters";
import { assessmentSubmissionsList } from "@/blockchain/dbRequests";
import useRequest from "@/composables/useRequest";
import { useAssessmentsStore } from "./assessmentsStore";
import { useFundsStore } from "./fundsStore";
import { useWalletStore } from "./walletStore";

export const useAssessmentSubmissionsStore = defineStore(
  "assessmentSubmissions",
  () => {
    const fundsStore = useFundsStore();
    const assessmentsStore = useAssessmentsStore();
    const walletStore = useWalletStore();

    const upcoming = ref([]);

    const upcomingCount = computed(() => upcoming.value.length);
    const upcomingCountVerbose = computed(
      () => `${upcomingCount.value}/${assessmentsStore.count - submittedCount.value}`,
    );
    const upcomingAssessments = computed(() =>
      assessmentsStore.all.filter(({ proposalId }) => upcoming.value.includes(proposalId)),
    );

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

    async function submit() {
      if (!fundsStore.selectedFundHash) {
        throw new Error("Fund not selected");
      }

      const submittingAssessmentsString = JSON.stringify(upcomingAssessments.value);
      const submittingAssessmentsBitArray = sjcl.hash.sha256.hash(submittingAssessmentsString);
      const submittingAssessmentsHash = sjcl.codec.hex.fromBits(submittingAssessmentsBitArray);
      const submittingAssessmentsProposalIds = upcomingAssessments.value.map(({ proposalId }) => proposalId);

      // create submission payload
      const submissionPayload = {
        fundHash: fundsStore.selectedFundHash,
        hashAlg: "sha256",
        assessmentsHash: submittingAssessmentsHash,
        proposalIds: submittingAssessmentsProposalIds,
      };

      // submit assessments
      return await walletStore.submitMetadataTx(
        BLOCKCHAIN_ACTIONS.assessmentsSubmission,
        submissionPayload,
        ({ confirmedMetadata }) => {
          submitted.value.push(
            ...assessmentsSubmissionFromBlockchain(confirmedMetadata, upcomingAssessments.value),
          );
        },
      );
    }

    const submitted = ref([]);
    const submittedCountVerbose = computed(() => `${submittedCount.value}/${assessmentsStore.count}`);
    const submittedCount = computed(() => submitted.value.length);
    const submittedProposalIds = computed(() => submitted.value.map(({ proposalId }) => proposalId));
    const loadAssessmentSubmissionsRequest = ref(null);

    function loadAssessmentSubmissions(stakeAddress) {
      if (stakeAddress) {
        loadAssessmentSubmissionsRequest.value?.remove();
        loadAssessmentSubmissionsRequest.value = useRequest(assessmentSubmissionsList, {
          requestArguments: [stakeAddress],
          onSuccess: (data) => {
            submitted.value = [].concat(
              ...data.map((submission) => {
                return assessmentsSubmissionFromBlockchain(submission, assessmentsStore.all);
              }),
            );
          },
        });
      } else {
        submitted.value = [];
      }
    }

    watch(
      () => walletStore.walletProps?.stakeAddress,
      (stakeAddress) => loadAssessmentSubmissions(stakeAddress),
      { immediate: true },
    );

    watch(
      submitted,
      () => {
        upcoming.value = upcoming.value.filter(
          (proposalId) => !submittedProposalIds.value.includes(proposalId),
        );
      },
      { immediate: true },
    );

    return {
      upcoming,
      upcomingAssessments,
      upcomingCount,
      upcomingCountVerbose,

      upcomingAdd,
      upcomingRemove,
      upcomingToggle,
      submit,

      submittedAssessments: submitted,
      submittedCount,
      submittedCountVerbose,
      submittedProposalIds,
      loadAssessmentSubmissionsRequest,
    };
  },
  {
    persist: {
      paths: ["upcoming", "submittedAssessments"],
    },
  },
);
