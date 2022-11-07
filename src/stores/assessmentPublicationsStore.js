import sjcl from "sjcl";
import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { BLOCKCHAIN_ACTIONS } from "@/blockchain/const";
import { assessmentsPublicationFromBlockchain } from "@/blockchain/converters";
import { assessmentPublicationsList } from "@/blockchain/dbRequests";
import { uploadToIPFS } from "@/ipfs/ipfsRequests";
import useRequest from "@/composables/useRequest";
import { useAssessmentsStore } from "./assessmentsStore";
import { useAssessmentSubmissionsStore } from "./assessmentSubmissionsStore";
import { useFundsStore } from "./fundsStore";
import { useNotificationsStore } from "./notificationsStore";
import { useWalletStore } from "./walletStore";

export const useAssessmentPublicationsStore = defineStore(
  "assessmentPublications",
  () => {
    const fundsStore = useFundsStore();
    const assessmentsStore = useAssessmentsStore();
    const assessmentSubmissionsStore = useAssessmentSubmissionsStore();
    const notificationsStore = useNotificationsStore();
    const walletStore = useWalletStore();

    const upcoming = ref([]);
    const upcomingCount = computed(() => upcoming.value.length);
    const upcomingCountVerbose = computed(
      () => `${upcomingCount.value}/${assessmentSubmissionsStore.submittedCount - publishedCount.value}`,
    );
    const upcomingAssessments = computed(() =>
      assessmentSubmissionsStore.submittedAssessments.filter(({ proposalId }) =>
        upcoming.value.includes(proposalId),
      ),
    );

    function upcomingAdd(proposalId) {
      const submission = assessmentSubmissionsStore.submittedAssessments.find(
        (assessment) => assessment.proposalId === proposalId,
      );
      if (submission) {
        upcoming.value = submission.proposalIds;
      }
    }

    function upcomingRemove(proposalId) {
      const submission = assessmentSubmissionsStore.submittedAssessments.find(
        (assessment) => assessment.proposalId === proposalId,
      );
      if (submission) {
        upcoming.value = [];
      }
    }

    function moveUpcomingToPending(proposalId) {
      upcomingRemove(proposalId);
      pendingAdd(proposalId);
    }

    const pending = ref([]);
    const pendingCount = computed(() => pending.value.length);
    const pendingCountVerbose = computed(() => {
      return `${pendingCount.value}/${
        assessmentSubmissionsStore.submittedCount - publishedCount.value - upcomingCount.value
      }`;
    });
    const pendingAssessments = computed(() =>
      assessmentSubmissionsStore.submittedAssessments.filter(({ proposalId }) =>
        pending.value.includes(proposalId),
      ),
    );

    function pendingAdd(proposalId) {
      const submission = assessmentSubmissionsStore.submittedAssessments.find(
        (assessment) => assessment.proposalId === proposalId,
      );
      if (assessmentsStore.has(proposalId)) {
        pending.value.push(...submission.proposalIds);
      }
    }

    function pendingRemove(proposalId) {
      const submission = assessmentSubmissionsStore.submittedAssessments.find(
        (assessment) => assessment.proposalId === proposalId,
      );
      if (submission) {
        pending.value = pending.value.filter((proposalId) => !submission.proposalIds.includes(proposalId));
      }
    }

    function movePendingToUpcoming(proposalId) {
      if (upcomingCount.value) {
        moveUpcomingToPending(upcoming.value[0]);
      }
      pendingRemove(proposalId);
      upcomingAdd(proposalId);
    }

    const countVerbose = computed(() => {
      return `${upcomingCount.value + pendingCount.value}/${publishedCount.value}`;
    });

    function isPublished(proposalId) {
      return !!published.value.find((submission) => submission.proposalId === proposalId);
    }

    const uploadToIPFSRequest = ref(null);

    async function publish() {
      if (!fundsStore.selectedFundHash) {
        throw new Error("Fund not selected");
      }

      const assessments = upcoming.value.map((proposalId) => ({
        ...assessmentsStore.getByProposalId(proposalId),
      }));

      const submittedAssessmentsHash = assessmentSubmissionsStore.submittedAssessments.find(
        ({ proposalId }) => proposalId === upcoming.value[0],
      )?.assessmentsHash;

      const publishingAssessmentsString = JSON.stringify(assessments);
      const publishingAssessmentsBitArray = sjcl.hash.sha256.hash(publishingAssessmentsString);
      const publishingAssessmentsHash = sjcl.codec.hex.fromBits(publishingAssessmentsBitArray);

      if (submittedAssessmentsHash !== publishingAssessmentsHash) {
        notificationsStore.add({
          type: "is-danger",
          text: "Submitted assessments and assessments for publication hashes mismatch",
          duration: 10000,
        });
      }

      const assessmentsBlob = new Blob([publishingAssessmentsString], { type: "application/json" });
      const assessmentsFile = new File([assessmentsBlob], "assessments.json");

      uploadToIPFSRequest.value = useRequest(uploadToIPFS, {
        requestArguments: [[assessmentsFile]],
        onSuccess: async (cid) => {
          notificationsStore.add({
            type: "is-info",
            text: "Assessments uploaded to IPFS, preparing publication transaction...",
            duration: 5000,
          });

          // create publication payload
          const publicationPayload = {
            fundHash: fundsStore.selectedFundHash,
            proposalIds: upcoming.value,
            assessmentsHash: publishingAssessmentsHash,
            assessmentsCID: cid,
          };

          // publish assessments
          return await walletStore.submitMetadataTx(
            BLOCKCHAIN_ACTIONS.assessmentsPublication,
            publicationPayload,
            ({ confirmedMetadata }) => {
              if (pendingCount.value) {
                upcomingAdd(pending.value[0]);
              } else {
                upcoming.value = [];
              }
              published.value.push(
                ...assessmentsPublicationFromBlockchain(confirmedMetadata, assessmentsStore.all),
              );
            },
          );
        },
      });
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
      moveUpcomingToPending,

      pending,
      pendingAssessments,
      pendingCount,
      pendingCountVerbose,

      pendingAdd,
      movePendingToUpcoming,

      countVerbose,
      isPublished,
      publish,

      publishedAssessments: published,
      publishedCount,
      publishedCountVerbose,
      publishedProposalIds,

      loadAssessmentPublicationsRequest,
      uploadToIPFSRequest,
    };
  },
  {
    persist: {
      paths: ["upcoming", "pending", "publishedAssessments"],
    },
  },
);
