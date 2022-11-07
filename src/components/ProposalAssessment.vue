<template>
  <div class="assessment">
    <button
      v-if="!assessment"
      class="button is-medium is-primary"
      @click="assessmentsStore.add(props.proposal.id)"
    >
      <span class="icon">
        <i class="fas fa-pen" />
      </span>
      <span>Create Assessment</span>
    </button>

    <div
      v-else
      class="is-relative"
    >
      <div class="saved-at">
        <span class="icon-text has-text-primary">
          <span class="icon">
            <i class="fas fa-save" />
          </span>
          <span>{{ savedAtVerbose }}</span>
        </span>
      </div>

      <div class="block">
        <article
          v-if="isSubmitted || isPublished"
          class="message is-warning"
        >
          <div class="message-header">
            <p>Read Only</p>
          </div>

          <div
            v-if="!isPublished"
            class="message-body"
          >
            Your assessment is submitted to the chain. It is no longer editable.
          </div>

          <div
            v-else
            class="message-body"
          >
            <p>
              Your assessment is publish to the chain. It is public and
              if approved will be provided to voters.
            </p>

            <div class="buttons mt-4">
              <a
                class="button is-link is-outlined"
                :href="ipfsUrl"
                target="_blank"
              >
                <span class="icon is-small">
                  <i class="fas fa-external-link-alt" />
                </span>
                <span>Open assessment on IPFS</span>
              </a>

              <button
                class="button is-info is-outlined"
                @click="exportPublishedAssessment"
              >
                <span class="icon is-small">
                  <i class="fas fa-download" />
                </span>
                <span>Export Assessment</span>
              </button>
            </div>
          </div>
        </article>

        <ProposalAssessmentCriterium
          :proposal="proposal"
          :criterium="criteria[1]"
        />
        <ProposalAssessmentCriterium
          :proposal="proposal"
          :criterium="criteria[2]"
        />
        <ProposalAssessmentCriterium
          :proposal="proposal"
          :criterium="criteria[3]"
        />

        <!-- TODO: removing confirmation -->
        <button
          v-if="assessment && !isSubmitted"
          class="button is-danger"
          @click="assessmentsStore.remove(props.proposal.id)"
        >
          <span class="icon">
            <i class="fas fa-trash" />
          </span>
          <span>Delete Assessment</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { IPFS_URL } from "@/ipfs/const";
import useAssessment from "@/composables/useAssessment";
import useDownload from "@/composables/useDownload";
import { useAssessmentsStore } from "@/stores/assessmentsStore";
import { useAssessmentSubmissionsStore } from "@/stores/assessmentSubmissionsStore";
import { useAssessmentPublicationsStore } from "@/stores/assessmentPublicationsStore";
import { useChallengesStore } from "@/stores/challengesStore";
import ProposalAssessmentCriterium from "./ProposalAssessmentCriterium.vue";

const props = defineProps({
  proposal: {
    type: Object,
    required: true,
  },
});

const assessmentsStore = useAssessmentsStore();
const assessmentSubmissionsStore = useAssessmentSubmissionsStore();
const assessmentPublicationsStore = useAssessmentPublicationsStore();
const challengesStore = useChallengesStore();

const { assessment, savedAtVerbose, isCompleted } = useAssessment(props.proposal.id);
const download = useDownload();

const challenge = computed(() => challengesStore.getById(props.proposal.category));

const criteria = computed(() => {
  return challengesStore.getCriteria(challenge.value.id).reduce((acc, cur) => {
    acc[cur.c_id] = cur;
    return acc;
  }, {});
});

const isSubmitted = computed(
  () => assessmentSubmissionsStore.submittedProposalIds.includes(props.proposal.id),
);

const isPublished = computed(
  () => assessmentPublicationsStore.publishedProposalIds.includes(props.proposal.id),
);

// const submission = computed(() => assessmentPublicationsStore.publishedAssessments.find(
//   ({ proposalId }) => proposalId === props.proposal.id),
// );

const publication = computed(() => assessmentPublicationsStore.publishedAssessments.find(
  ({ proposalId }) => proposalId === props.proposal.id),
);

const ipfsUrl = computed(() => `${IPFS_URL}/${publication.value.assessmentsCID}`);

const isExporting = ref(false);

async function exportPublishedAssessment() {
  isExporting.value = true;
  try {
    const response = await fetch(ipfsUrl.value);
    const json = await response.json();
    download.toJson(json, `Assessment ${publication.value.proposalTitle}.json`);
  } catch (err) {
    void err;
  } finally {
    isExporting.value = false;
  }
}

watch(isCompleted, (isCompleted) => {
  if (isCompleted) {
    assessmentSubmissionsStore.upcomingAdd(props.proposal.id);
  } else {
    assessmentSubmissionsStore.upcomingRemove(props.proposal.id);
    assessmentSubmissionsStore.pendingRemove(props.proposal.id);
  }
});
</script>

<style scoped>
.saved-at {
  position: absolute;
  right: 0;
  top: 0;
  background: #F5F5F5;
  padding: 0.25em 0.5em;
  border-radius: 0.25em;
}
</style>
