<template>
  <progress
    v-if="!proposal"
    class="progress is-small is-primary"
    max="100"
  />

  <div
    v-else
    class="assessment-preview"
  >
    <div class="columns is-multiline">
      <div class="column is-8">
        <RouterLink :to="{ name: 'Proposal', params: { id: proposal.id }}">
          {{ proposal.title }}
        </RouterLink>

        <div class="buttons mt-4">
          <button
            class="button is-small is-primary"
            @click="isOpened = !isOpened"
          >
            <span class="icon">
              <i class="fas fa-pen" />
            </span>
            <span>
              {{ isOpened ? 'Close' : 'Access assessment' }}
            </span>
          </button>

          <button
            class="button is-small is-primary"
            :disabled="!isCompleted"
            @click="assessmentSubmissionsStore.upcomingToggle(props.proposalId)"
          >
            <span class="icon">
              <i :class="`fas fa-${isInUpcomingSubmissions ? 'minus' : 'plus'}`" />
            </span>
            <span>
              {{ isInUpcomingSubmissions ? 'Remove from' : 'Add to' }} submissions
            </span>
          </button>

          <a
            class="button is-small is-link"
            :href="proposal.url"
            target="_blank"
          >
            <span class="icon">
              <i class="fas fa-link" />
            </span>
            <span>
              Open in IdeaScale
            </span>
          </a>
        </div>
      </div>

      <div class="column is-4 is-flex is-flex-direction-column is-justify-content-center">
        <span>
          Assessment Completion:
          <b>{{ completion }}%</b>
        </span>

        <progress
          class="progress is-success"
          :value="completion"
          max="100"
        >
          {{ completion }}%
        </progress>
      </div>
    </div>

    <div
      v-if="isOpened"
      class="container details"
    >
      <ProposalAssessment :proposal="proposal" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import useAssessment from "@/composables/useAssessment";
import { useAssessmentSubmissionsStore } from "@/stores/assessmentSubmissionsStore";
import ProposalAssessment from "./ProposalAssessment.vue";

const props = defineProps({
  proposalId: {
    type: Number,
    required: true,
  },
});

const assessmentSubmissionsStore = useAssessmentSubmissionsStore();

const { proposal, completion, isCompleted } = useAssessment(props.proposalId);

const isOpened = ref(false);

const isInUpcomingSubmissions = computed(
  () => assessmentSubmissionsStore.upcoming.includes(props.proposalId),
);
</script>

<style>
.assessment-preview {
  padding: 20px;
  width: 100%;
}

.assessment-preview:nth-child(odd) {
  background: #F1F1F1;
}
</style>
