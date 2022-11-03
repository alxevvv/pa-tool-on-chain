<template>
  <div
    v-if="assessmentSubmissionsStore.submittedAssessments.length"
    class="table-container"
  >
    <table class="table is-fullwidth">
      <thead>
        <tr>
          <th>Id</th>
          <th>Proposal</th>
          <th>Submitted At (UTC)</th>
          <th />
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="assessment in assessmentSubmissionsStore.submittedAssessments"
          :key="assessment.proposalId"
        >
          <td>
            {{ assessment.txId }}.{{ assessment.proposalId }}
          </td>
          <td>
            <RouterLink :to="{ name: 'Proposal', params: { id: assessment.proposalId }}">
              {{ assessment.proposalTitle }}
            </RouterLink>
          </td>
          <td>
            {{ dayjs(assessment.blockTime).format('DD.MM.YYYY, HH:mm') }}
          </td>
          <td class="is-flex is-justify-content-end">
            <template v-if="!assessmentPublicationsStore.isPublished(assessment.proposalId)">
              <button
                v-if="assessmentPublicationsStore.upcoming.includes(assessment.proposalId)"
                class="button is-small is-primary is-outlined"
                :disabled="walletStore.isTxSubmitting || walletStore.isTxConfirming"
                @click="assessmentPublicationsStore.upcomingRemove(assessment.proposalId)"
              >
                <span class="icon">
                  <i class="fas fa-minus" />
                </span>
                <span>
                  Remove from publications
                </span>
              </button>

              <button
                v-else
                class="button is-small is-primary is-outlined"
                :disabled="walletStore.isTxSubmitting || walletStore.isTxConfirming"
                @click="assessmentPublicationsStore.upcomingAdd(assessment.proposalId)"
              >
                <span class="icon">
                  <i class="fas fa-plus" />
                </span>
                <span>
                  Add to publications
                </span>
              </button>
            </template>

            <div
              v-else
              class="tags are-small is-flex is-justify-content-end"
            >
              <span
                class="tag is-success"
              >Published</span>
            </div>
          </td>
          <td>
            <button
              class="button is-small is-info is-outlined"
              @click="infoModalSubmissionId = `${assessment.txId}.${assessment.proposalId}`"
            >
              <span class="icon">
                <i class="fas fa-info" />
              </span>
              <span>
                Info
              </span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <BModal
      title="Submission info"
      :width="800"
      :is-active="!!infoModalSubmissionId"
      @close="infoModalSubmissionId = ''"
    >
      <div class="submission-info-modal">
        <h4 class="is-size-4 mb-4 has-text-weight-bold">
          {{ submissionInModal?.proposalTitle }}
        </h4>
        <p>
          <b>Submitted at:</b>
          {{ dayjs(submissionInModal?.blockTime).format('DD.MM.YYYY, HH:mm') }}
        </p>
        <p>
          <b>Transaction Hash</b>
          <code>{{ submissionInModal?.txHash }}</code>
        </p>
        <h4 class="is-size-5 mt-4 mb-4">
          Submission payload
        </h4>
        <pre>{{ submissionInModalPayload }}</pre>
      </div>

      <template #footer>
        <button
          class="button is-primary"
          @click="infoModalSubmissionId = ''"
        >
          OK
        </button>
        <button
          class="button is-info is-outlined"
          @click="copyToClipboard"
        >
          <span class="icon is-small">
            <i class="fas fa-clipboard" />
          </span>
          <span>Copy to clipboard</span>
        </button>
      </template>
    </BModal>
  </div>

  <div
    v-else
    class="has-text-centered"
  >
    No submitted assessments
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { computed, ref } from "vue";
import useClipboard from "@/composables/useClipboard";
import { useWalletStore } from "@/stores/walletStore";
import { useAssessmentSubmissionsStore } from "@/stores/assessmentSubmissionsStore";
import { useAssessmentPublicationsStore } from "@/stores/assessmentPublicationsStore";
import BModal from "@/components/BModal.vue";

const clipboard = useClipboard();

const walletStore = useWalletStore();
const assessmentSubmissionsStore = useAssessmentSubmissionsStore();
const assessmentPublicationsStore = useAssessmentPublicationsStore();

const infoModalSubmissionId = ref("");

const submissionInModal = computed(() => {
  if (!infoModalSubmissionId.value) {
    return null;
  }
  const [txId, proposalId] = infoModalSubmissionId.value.split(".").map((id) => parseInt(id));
  return assessmentSubmissionsStore.submittedAssessments.find((assessment) => (
    assessment.txId === txId && assessment.proposalId === proposalId
  ));
});

const submissionInModalPayload = computed(() => {
  if (!submissionInModal.value) {
    return "";
  }
  return {
    hashAlg: submissionInModal.value.hashAlg,
    fundHash: submissionInModal.value.fundHash,
    proposalIds: submissionInModal.value.proposalIds,
    assessmentsHash: submissionInModal.value.assessmentsHash,
  };
});

function copyToClipboard() {
  clipboard.copy(JSON.stringify(submissionInModalPayload.value, null, 2));
}
</script>

<style scoped>
.table td {
  height: 48px;
}
</style>
