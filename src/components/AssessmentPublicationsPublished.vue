<template>
  <div
    v-if="assessmentPublicationsStore.publishedAssessments.length"
    class="table-container"
  >
    <table class="table is-fullwidth">
      <thead>
        <tr>
          <th>Id</th>
          <th>Proposal</th>
          <th>Published At (UTC)</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="assessment in assessmentPublicationsStore.publishedAssessments"
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
          <td>
            <button
              class="button is-small is-info is-outlined"
              @click="infoModalPublicationId = `${assessment.txId}.${assessment.proposalId}`"
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

    <div class="buttons">
      <button
        :class="`button is-info is-outlined${isExporting ? ' is-loading' : ''}`"
        @click="exportPublications"
      >
        <span class="icon is-small">
          <i class="fas fa-download" />
        </span>
        <span>Export list</span>
      </button>
    </div>

    <BModal
      title="Publication info"
      :width="800"
      :is-active="!!infoModalPublicationId"
      @close="infoModalPublicationId = ''"
    >
      <div class="publication-info-modal">
        <h4 class="is-size-4 mb-4 has-text-weight-bold">
          {{ publicationInModal?.proposalTitle }}
        </h4>
        <p>
          <b>Submitted at:</b>
          {{ dayjs(publicationInModal?.blockTime).format('DD.MM.YYYY, HH:mm') }}
        </p>
        <p>
          <b>Transaction Hash</b>
          <code>{{ publicationInModal?.txHash }}</code>
        </p>
        <h4 class="is-size-5 mt-4 mb-4">
          Publication payload
        </h4>
        <pre>{{ publicationInModalPayload }}</pre>
        <br>
        <div class="buttons">
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
        </div>
      </div>

      <template #footer>
        <button
          class="button is-primary"
          @click="infoModalPublicationId = ''"
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
          <span>Copy publication details</span>
        </button>
      </template>
    </BModal>
  </div>

  <div
    v-else
    class="has-text-centered"
  >
    No published assessments
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { computed, ref } from "vue";
import { IPFS_URL } from "@/ipfs/const";
import useClipboard from "@/composables/useClipboard";
import useDownload from "@/composables/useDownload";
import { useAssessmentPublicationsStore } from "@/stores/assessmentPublicationsStore";
import BModal from "@/components/BModal.vue";

const clipboard = useClipboard();
const download = useDownload();

const assessmentPublicationsStore = useAssessmentPublicationsStore();

const infoModalPublicationId = ref("");

const publicationInModal = computed(() => {
  if (!infoModalPublicationId.value) {
    return null;
  }
  const [txId, proposalId] = infoModalPublicationId.value.split(".").map((id) => parseInt(id));
  return assessmentPublicationsStore.publishedAssessments.find((assessment) => (
    assessment.txId === txId && assessment.proposalId === proposalId
  ));
});

const publicationInModalPayload = computed(() => {
  if (!publicationInModal.value) {
    return "";
  }
  return {
    hashAlg: publicationInModal.value.hashAlg,
    fundHash: publicationInModal.value.fundHash,
    proposalIds: publicationInModal.value.proposalIds,
    assessmentsHash: publicationInModal.value.assessmentsHash,
    assessmentsCID: publicationInModal.value.assessmentsCID,
  };
});

const ipfsUrl = computed(() => `${IPFS_URL}/${publicationInModalPayload.value.assessmentsCID}`);

function copyToClipboard() {
  clipboard.copy(JSON.stringify(publicationInModalPayload.value, null, 2));
}

const isExporting = ref(false);

async function exportPublications() {
  isExporting.value = true;

  const CIDs = Array.from(
    new Set(assessmentPublicationsStore.publishedAssessments.map(({ assessmentsCID }) => assessmentsCID)),
  );

  const responses = await Promise.all(CIDs.map((cid) => fetch(`${IPFS_URL}/${cid}`)));
  const jsons = await Promise.all(responses.map((response) => response.json()));

  download.toJson([].concat(...jsons), "Published assessments.json");

  isExporting.value = false;
}
</script>
