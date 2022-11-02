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
            {{ dayjs(assessment.blockTime).format('DD-MM-YYYY, HH:mm') }}
          </td>
          <td class="is-flex is-justify-content-end">
            <template v-if="!assessmentPublicationsStore.isPublished(assessment.proposalId)">
              <button
                v-if="assessmentPublicationsStore.upcoming.includes(assessment.proposalId)"
                class="button is-small is-primary"
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
                class="button is-small is-primary"
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
        </tr>
      </tbody>
    </table>
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
import { useWalletStore } from "@/stores/walletStore";
import { useAssessmentSubmissionsStore } from "@/stores/assessmentSubmissionsStore";
import { useAssessmentPublicationsStore } from "@/stores/assessmentPublicationsStore";

const walletStore = useWalletStore();
const assessmentSubmissionsStore = useAssessmentSubmissionsStore();
const assessmentPublicationsStore = useAssessmentPublicationsStore();
</script>
