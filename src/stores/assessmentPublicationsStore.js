import sjcl from "sjcl";
import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { BLOCKCHAIN_ACTIONS } from "@/blockchain/const";
import { assessmentsPublicationFromBlockchain } from "@/blockchain/converters";
import { assessmentPublicationsList } from "@/blockchain/dbRequests";
import useRequest from "@/composables/useRequest";
import { useAssessmentsStore } from "./assessmentsStore";
import { useAssessmentSubmissionsStore } from "./assessmentSubmissionsStore";
import { useFundsStore } from "./fundsStore";
import { useWalletStore } from "./walletStore";

export const useAssessmentPublicationsStore = defineStore(
  "assessmentPublications",
  () => {
    const fundsStore = useFundsStore();
    const assessmentsStore = useAssessmentsStore();
    const assessmentSubmissionsStore = useAssessmentSubmissionsStore();
    const walletStore = useWalletStore();

    const upcoming = ref([]);

    const upcomingCount = computed(() => upcoming.value.length);
    const upcomingCountVerbose = computed(
      () => `${upcomingCount.value}/${assessmentsStore.count - publishedCount.value}`,
    );
    const upcomingAssessments = computed(() =>
      assessmentsStore.all.filter(({ proposalId }) => upcoming.value.includes(proposalId)),
    );

    function upcomingAdd(proposalId) {
      if (assessmentSubmissionsStore.isSubmitted(proposalId)) {
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

    async function publish() {
      if (!fundsStore.selectedFundHash) {
        throw new Error("Fund not selected");
      }

      console.log("publications publish", { assessments: upcomingAssessments.value });

      // const submittingAssessmentsString = JSON.stringify(upcomingAssessments.value);
      // const submittingAssessmentsBitArray = sjcl.hash.sha256.hash(submittingAssessmentsString);
      // const submittingAssessmentsHash = sjcl.codec.hex.fromBits(submittingAssessmentsBitArray);
      // const submittingAssessmentsProposalIds = upcomingAssessments.value.map(({ proposalId }) => proposalId);

      // // create submission payload
      // const submissionPayload = {
      //   fundHash: fundsStore.selectedFundHash,
      //   hashAlg: "sha256",
      //   assessmentsHash: submittingAssessmentsHash,
      //   proposalIds: submittingAssessmentsProposalIds,
      // };

      // // publish assessments
      // return await walletStore.submitMetadataTx(
      //   BLOCKCHAIN_ACTIONS.assessmentsPublication,
      //   submissionPayload,
      //   ({ confirmedMetadata }) => {
      //     published.value.push(
      //       ...assessmentsPublicationFromBlockchain(confirmedMetadata, upcomingAssessments.value),
      //     );
      //   },
      // );
    }

    const published = ref([]);
    const publishedCountVerbose = computed(() => `${publishedCount.value}/${assessmentsStore.count}`);
    const publishedCount = computed(() => published.value.length);
    const publishedProposalIds = computed(() => published.value.map(({ proposalId }) => proposalId));
    const loadAssessmentPublicationsRequest = ref(null);

    function loadAssessmentPublications(stakeAddress) {
      if (stakeAddress) {
        loadAssessmentPublicationsRequest.value?.remove();
        loadAssessmentPublicationsRequest.value = useRequest(assessmentPublicationsList, {
          requestArguments: [stakeAddress],
          onSuccess: (data) => {
            published.value = [].concat(
              ...data.map((submission) => {
                return assessmentsPublicationFromBlockchain(submission, assessmentsStore.all);
              }),
            );
          },
        });
      } else {
        published.value = [];
      }
    }

    watch(
      () => walletStore.walletProps?.stakeAddress,
      (stakeAddress) => loadAssessmentPublications(stakeAddress),
      { immediate: true },
    );

    watch(
      published,
      () => {
        upcoming.value = upcoming.value.filter(
          (proposalId) => !publishedProposalIds.value.includes(proposalId),
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
      publish,

      publishedAssessments: published,
      publishedCount,
      publishedCountVerbose,
      publishedProposalIds,
      loadAssessmentPublicationsRequest,
    };
  },
  {
    persist: {
      paths: ["upcoming", "publishedAssessments"],
    },
  },
);
