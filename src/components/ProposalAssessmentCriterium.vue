<template>
  <div class="criterium mb-4 columns is-multiline">
    <div class="column is-12">
      <h5 class="title is-5">
        {{ props.criterium.question }}
      </h5>
    </div>

    <div class="column is-2">
      <BRate
        v-model="rateValue"
        :label-text="`Rating for ${props.criterium.title}`"
        :readonly="isSubmitted"
      />
    </div>

    <div class="column is-10">
      <div class="field">
        <label class="label">Rationale for {{ props.criterium.title }}</label>
        <div class="control">
          <textarea
            v-model="noteValue"
            :readonly="isSubmitted"
            class="textarea"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import debounce from "lodash/debounce";
import { computed } from "vue";
import useAssessment from "@/composables/useAssessment";
import { useAssessmentSubmissionsStore } from "@/stores/assessmentSubmissionsStore";
import BRate from "./BRate.vue";

const props = defineProps({
  proposal: {
    type: Object,
    required: true,
  },
  criterium: {
    type: Object,
    required: true,
  },
});

const assessmentSubmissionsStore = useAssessmentSubmissionsStore();

const { assessment, setField } = useAssessment(props.proposal.id);

const isSubmitted = computed(
  () => assessmentSubmissionsStore.submittedProposalIds.includes(props.proposal.id),
);

const rateKey = computed(() => `rate${props.criterium.c_id}`);

const rateValue = computed({
  get() {
    return assessment.value[rateKey.value];
  },
  set(value) {
    setField(rateKey.value, value);
  },
});

const noteKey = computed(() => `note${props.criterium.c_id}`);

const noteValue = computed({
  get() {
    return assessment.value[noteKey.value];
  },
  set: debounce((value) => {
    setField(noteKey.value, value);
  }, 500),
});
</script>
