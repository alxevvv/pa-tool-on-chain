<template>
  <div
    v-if="assessmentSubmissionsStore.pendingAssessments.length"
    class="table-container"
  >
    <table class="table is-fullwidth">
      <thead>
        <tr>
          <th>Id</th>
          <th>Proposal</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="assessment in assessmentSubmissionsStore.pendingAssessments"
          :key="assessment.proposalId"
        >
          <td>
            {{ assessment.proposalId }}
          </td>
          <td>
            <RouterLink :to="{ name: 'Proposal', params: { id: assessment.proposalId }}">
              {{ assessment.proposalTitle }}
            </RouterLink>
          </td>
          <td class="is-flex is-justify-content-end">
            <button
              class="button is-small is-primary is-outlined"
              :disabled="walletStore.isTxSubmitting || walletStore.isTxConfirming"
              @click="assessmentSubmissionsStore.movePendingToUpcoming(assessment.proposalId)"
            >
              <span class="icon">
                <i class="fas fa-arrow-left" />
              </span>
              <span>
                Move to Assessed
              </span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div
    v-if="!assessmentSubmissionsStore.pending.length"
    class="has-text-centered"
  >
    No pending assessments
  </div>
</template>

<script setup>
import { useWalletStore } from "@/stores/walletStore";
import { useAssessmentSubmissionsStore } from "@/stores/assessmentSubmissionsStore";

const walletStore = useWalletStore();
const assessmentSubmissionsStore = useAssessmentSubmissionsStore();
</script>
