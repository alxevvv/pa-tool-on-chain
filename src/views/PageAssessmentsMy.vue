<template>
  <div class="section container">
    <h1 class="title">
      My Assessments
      <span v-if="fundsStore.selectedFund">({{ assessmentsStore.countVerbose }})</span>
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

    <div v-else>
      <article class="message">
        <div class="message-body">
          <p>
            This page collects all the proposals that you assessed <b>within the pa-tool</b>
            and could be used to keep your assessments organized.
          </p>
          <br>
          <p>
            This tool uses localStorage and cookies to store the progress of your work.<br>
            If you're using a setup where cookies are cleared at every browser launch,
            be careful because you may lose your work! You should export (download)
            the file, and re-import it every time or add a exception to your browser's settings.
          </p>
        </div>
      </article>

      <div class="block">
        <AssessmentPreview
          v-for="assessment in assessmentsStore.all"
          :key="assessment.proposalId"
          :proposal-id="assessment.proposalId"
        />
      </div>

      <div
        v-if="assessmentsStore.count"
        class="block"
      >
        <article class="message">
          <div class="message-body buttons">
            <button
              class="button is-primary is-light"
            >
              <span class="icon">
                <i class="fas fa-download" />
              </span>
              <span>
                Export assessments
              </span>
            </button>

            <button
              class="button is-danger is-light"
            >
              <span class="icon">
                <i class="fas fa-trash" />
              </span>
              <span>
                Clear local database
              </span>
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import AssessmentPreview from "@/components/AssessmentPreview.vue";
import { useAssessmentsStore } from "@/stores/assessmentsStore";
import { useFundsStore } from "@/stores/fundsStore";

const assessmentsStore = useAssessmentsStore();
const fundsStore = useFundsStore();

const isPageLoading = computed(() => {
  return fundsStore.loadFundsRequest?.request?.isLoading;
});
</script>
