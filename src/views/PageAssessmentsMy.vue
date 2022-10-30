<template>
  <div class="section container">
    <h1 class="title">
      My Assessments {{ count }}
    </h1>

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
</template>

<script setup>
import { computed } from "vue";
import AssessmentPreview from "@/components/AssessmentPreview.vue";
import { useAssessmentsStore } from "@/stores/assessmentsStore";
import { useProposalsStore } from "@/stores/proposalsStore";

const assessmentsStore = useAssessmentsStore();
const proposalsStore = useProposalsStore();

const count = computed(() => {
  const assessmentsCount = assessmentsStore.count;
  const proposalsCount = proposalsStore.count;
  if (assessmentsCount && proposalsCount) {
    return `(${assessmentsCount}/${proposalsCount})`;
  } else {
    return "";
  }
});
</script>
