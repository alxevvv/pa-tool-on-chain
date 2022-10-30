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
      />
    </div>

    <div class="column is-10">
      <div class="field">
        <label class="label">Rationale for {{ props.criterium.title }}</label>
        <div class="control">
          <textarea
            v-model="noteValue"
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
import { useAssessmentsStore } from "@/stores/assessmentsStore";
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

const assessmentsStore = useAssessmentsStore();

const assessment = computed(() => assessmentsStore.getByProposalId(props.proposal.id));

const rateKey = computed(() => `rate${props.criterium.c_id}`);

const rateValue = computed({
  get() {
    return assessment.value[rateKey.value];
  },
  set(value) {
    assessmentsStore.set(props.proposal.id, rateKey.value, value);
  },
});

const noteKey = computed(() => `note${props.criterium.c_id}`);

const noteValue = computed({
  get() {
    return assessment.value[noteKey.value];
  },
  set: debounce((value) => {
    assessmentsStore.set(props.proposal.id, noteKey.value, value);
  }, 500),
});
</script>
