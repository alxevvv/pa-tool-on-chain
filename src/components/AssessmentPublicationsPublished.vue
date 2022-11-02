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
            {{ dayjs(assessment.blockTime).format('DD-MM-YYYY, HH:mm') }}
          </td>
        </tr>
      </tbody>
    </table>
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
import { useAssessmentPublicationsStore } from "@/stores/assessmentPublicationsStore";

const assessmentPublicationsStore = useAssessmentPublicationsStore();
</script>
