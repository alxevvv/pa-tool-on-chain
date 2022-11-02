<template>
  <div
    v-if="assessmentSubmissionsStore.upcomingAssessments.length"
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
          v-for="assessment in assessmentSubmissionsStore.upcomingAssessments"
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
              class="button is-small is-danger is-outlined"
              :disabled="walletStore.isTxSubmitting || walletStore.isTxConfirming"
              @click="assessmentSubmissionsStore.upcomingRemove(assessment.proposalId)"
            >
              <span class="icon">
                <i class="fas fa-minus" />
              </span>
              <span>
                Remove
              </span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div
    v-if="!assessmentSubmissionsStore.upcoming.length"
    class="has-text-centered"
  >
    No assessments for submission
  </div>

  <div
    v-if="fundsStore.isOpenedForAssessmentSubmission"
    class="buttons"
  >
    <WalletConnectButton v-if="!walletStore.isConnected" />
    <ButtonAssessmentsSubmit v-else />
  </div>
</template>

<script setup>
import WalletConnectButton from "@/components/WalletConnectButton.vue";
import ButtonAssessmentsSubmit from "@/components/ButtonAssessmentsSubmit.vue";
import { useFundsStore } from "@/stores/fundsStore";
import { useWalletStore } from "@/stores/walletStore";
import { useAssessmentSubmissionsStore } from "@/stores/assessmentSubmissionsStore";

const fundsStore = useFundsStore();
const walletStore = useWalletStore();
const assessmentSubmissionsStore = useAssessmentSubmissionsStore();
</script>
