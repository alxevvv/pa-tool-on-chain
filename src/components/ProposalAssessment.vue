<template>
  <div class="assessment">
    <button
      v-if="!assessment"
      class="button is-medium is-primary"
      @click="assessmentsStore.add(props.proposal.id)"
    >
      <span class="icon">
        <i class="fas fa-pen" />
      </span>
      <span>Create Assessment</span>
    </button>

    <div
      v-else
      class="is-relative"
    >
      <div class="saved-at">
        <span class="icon-text has-text-primary">
          <span class="icon">
            <i class="fas fa-save" />
          </span>
          <span>{{ savedAt }}</span>
        </span>
      </div>

      <div class="block">
        <ProposalAssessmentCriterium :criterium="criteria[1]" />
        <ProposalAssessmentCriterium :criterium="criteria[2]" />
        <ProposalAssessmentCriterium :criterium="criteria[3]" />

        <button
          v-if="assessment"
          class="button is-danger"
          @click="assessmentsStore.remove(props.proposal.id)"
        >
          <span class="icon">
            <i class="fas fa-trash" />
          </span>
          <span>Delete Assessment</span>
        </button>
      </div>

      <!-- <div class="block">
        <pre>{{ assessment }}</pre>
        <br>
        <pre>{{ proposal }}</pre>
        <br>
        <pre>{{ challenge }}</pre>
        <br>
        <pre>{{ criteria[1] }}</pre>
        <br>
        <pre>{{ criteria[2] }}</pre>
        <br>
        <pre>{{ criteria[3] }}</pre>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { useAssessmentsStore } from "@/stores/assessmentsStore";
import { useChallengesStore } from "@/stores/challengesStore";
import ProposalAssessmentCriterium from "./ProposalAssessmentCriterium.vue";
import { computed } from "vue";

const props = defineProps({
  proposal: {
    type: Object,
    required: true,
  },
});

const assessmentsStore = useAssessmentsStore();
const challengesStore = useChallengesStore();

const assessment = computed(() => {
  return assessmentsStore.getByProposalId(props.proposal.id);
});

const challenge = computed(() => {
  return challengesStore.getById(props.proposal.category);
});

const criteria = computed(() => {
  return challengesStore.getCriteria(challenge.value.id).reduce((acc, cur) => {
    acc[cur.c_id] = cur;
    return acc;
  }, {});
});

const savedAt = computed(() => {
  const lastUpdate = assessment.value.lastUpdate;
  if (!lastUpdate) {
    return "Not saved";
  } else {
    const diff = lastUpdate - dayjs.utc().unix();
    return `Saved ${dayjs.duration(diff, "seconds").humanize(true)}`;
  }
});
</script>

<style scoped>
.saved-at {
  position: absolute;
  right: 0;
  top: 0;
  background: #F5F5F5;
  padding: 0.25em 0.5em;
  border-radius: 0.25em;
}
</style>
