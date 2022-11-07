<template>
  <div
    v-if="assessmentPublicationsStore.pendingAssessments.length"
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
          v-for="assessment in assessmentPublicationsStore.pendingAssessments"
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
          <td class="is-flex is-justify-content-end">
            <button
              class="button is-small is-primary is-outlined"
              :disabled="walletStore.isTxSubmitting || walletStore.isTxConfirming"
              @click="assessmentPublicationsStore.movePendingToUpcoming(assessment.proposalId)"
            >
              <span class="icon">
                <i class="fas fa-arrow-left" />
              </span>
              <span>
                Move to Awaiting
              </span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div
    v-if="!assessmentPublicationsStore.pending.length"
    class="has-text-centered"
  >
    No pending assessments
  </div>
</template>

<script setup>
import { useWalletStore } from "@/stores/walletStore";
import { useAssessmentPublicationsStore } from "@/stores/assessmentPublicationsStore";

const walletStore = useWalletStore();
const assessmentPublicationsStore = useAssessmentPublicationsStore();
</script>
