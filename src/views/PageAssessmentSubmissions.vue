<template>
  <div class="section container">
    <h1 class="title">
      Assessment submissions
      <span v-if="fundsStore.selectedFund">({{ assessmentSubmissionsStore.countVerbose }})</span>
    </h1>

    <progress
      v-if="isPageLoading"
      class="progress is-small is-primary"
      max="100"
    />

    <article
      v-else-if="!fundsStore.selectedFund"
      class="message is-warning"
    >
      <div class="message-body">
        <p>
          No selected fund
        </p>
      </div>
    </article>

    <article
      v-else-if="fundsStore.isQaDisabled"
      class="message is-warning"
    >
      <div class="message-body">
        <p>
          Quality Assurance disabled for selected fund
        </p>
      </div>
    </article>

    <div
      v-else
      class="block"
    >
      <article
        v-if="fundsStore.isOpenedForAssessmentSubmission"
        class="message is-info"
      >
        <div class="message-body">
          <p>
            Fund is currently open for assessment submissions.
          </p>
          <p>
            Assessment submission period ends on: <b>{{ endDateFormatted }}</b>
          </p>
        </div>
      </article>

      <article
        v-else-if="!fundsStore.isOpenedForAssessmentSubmission"
        class="message is-info"
      >
        <div class="message-body">
          <p>
            Fund is currently close for assessment submissions.
          </p>
          <p>
            Assessment submission period is: <b>{{ periodFormatted }}</b>
          </p>
        </div>
      </article>

      <article
        v-if="fundsStore.isOpenedForAssessmentSubmission && assessmentSubmissionsStore.upcomingCount"
        class="message"
      >
        <div class="message-body">
          <p>
            You have {{ assessmentSubmissionsStore.upcomingCountVerbose }} assessments checked
            for submission. Each submission incurs the Cardano transaction fee (approx. 0.17ada
            repaid as a part of your assessment rewards). Consider submitting all your assessments at once.
          </p>
        </div>
      </article>
    </div>

    <div
      v-if="fundsStore.selectedFund && !fundsStore.isQaDisabled && !isPageLoading"
      class="block box"
    >
      <div class="tabs">
        <ul>
          <li :class="route.name === 'AssessmentSubmissionsUpcoming' && 'is-active'">
            <RouterLink :to="{name: 'AssessmentSubmissionsUpcoming'}">
              Upcoming ({{ assessmentSubmissionsStore.upcomingAssessments.length }})
            </RouterLink>
          </li>
          <li :class="route.name === 'AssessmentSubmissionsSubmitted' && 'is-active'">
            <RouterLink :to="{name: 'AssessmentSubmissionsSubmitted'}">
              Submitted ({{ assessmentSubmissionsStore.submittedAssessments.length }})
            </RouterLink>
          </li>
        </ul>
      </div>

      <div>
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useFundsStore } from "@/stores/fundsStore";
import { useAssessmentSubmissionsStore } from "@/stores/assessmentSubmissionsStore";
import { useAssessmentPublicationsStore } from "@/stores/assessmentPublicationsStore";

const route = useRoute();

const fundsStore = useFundsStore();
const assessmentSubmissionsStore = useAssessmentSubmissionsStore();
const assessmentPublicationsStore = useAssessmentPublicationsStore();

const isPageLoading = computed(() => {
  return (
    fundsStore.loadFundsRequest?.request?.isLoading ||
    !assessmentSubmissionsStore.loadAssessmentSubmissionsRequest?.request ||
    assessmentSubmissionsStore.loadAssessmentSubmissionsRequest?.request?.isLoading ||
    !assessmentPublicationsStore.loadAssessmentPublicationsRequest?.request ||
    assessmentPublicationsStore.loadAssessmentPublicationsRequest?.request?.isLoading
  );
});

const startDate = computed(() => dayjs(fundsStore.selectedFund?.assessmentSubmissionStartDate));
const endDate = computed(() => dayjs(fundsStore.selectedFund?.assessmentSubmissionEndDate));
const startDateFormatted = computed(() => startDate.value.format("DD.MM.YYYY HH:mm"));
const endDateFormatted = computed(() => endDate.value.format("DD.MM.YYYY HH:mm"));
const periodFormatted = computed(() => `${startDateFormatted.value} – ${endDateFormatted.value}`);
</script>
