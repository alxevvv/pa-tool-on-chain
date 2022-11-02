<template>
  <div
    v-if="assessmentPublicationsStore.upcomingAssessments.length"
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
          v-for="assessment in assessmentPublicationsStore.upcomingAssessments"
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
              class="button is-small is-danger is-outlined"
              :disabled="walletStore.isTxSubmitting || walletStore.isTxConfirming"
              @click="assessmentPublicationsStore.upcomingRemove(assessment.proposalId)"
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
    v-if="!assessmentPublicationsStore.upcoming.length"
    class="has-text-centered"
  >
    No assessments for publication
  </div>

  <div
    v-if="fundsStore.isOpenedForAssessmentPublishing"
    class="buttons"
  >
    <WalletConnectButton v-if="!walletStore.isConnected" />
    <ButtonAssessmentsPublish v-else />
  </div>
</template>

<script setup>
import WalletConnectButton from "@/components/WalletConnectButton.vue";
import ButtonAssessmentsPublish from "@/components/ButtonAssessmentsPublish.vue";
import { useFundsStore } from "@/stores/fundsStore";
import { useWalletStore } from "@/stores/walletStore";
import { useAssessmentPublicationsStore } from "@/stores/assessmentPublicationsStore";

const fundsStore = useFundsStore();
const walletStore = useWalletStore();
const assessmentPublicationsStore = useAssessmentPublicationsStore();
</script>
