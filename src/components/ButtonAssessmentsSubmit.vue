<template>
  <button
    :class="buttonClasses"
    @click="assessmentsSubmissionsStore.submit"
  >
    Submit assessments
  </button>
</template>

<script setup>
import { computed } from "vue";
import { useWalletStore } from "@/stores/walletStore";
import { useAssessmentSubmissionsStore } from "@/stores/assessmentSubmissionsStore";

const props = defineProps({
  size: {
    type: String,
    default: "is-normal",
  },
});

const walletStore = useWalletStore();
const assessmentsSubmissionsStore = useAssessmentSubmissionsStore();

const buttonClasses = computed(() => {
  const classes = ["button", "is-primary", props.size];
  if (
    walletStore.isTxSubmitting
    || walletStore.isTxConfirming
  ) {
    classes.push("is-loading");
  }
  return classes;
});
</script>
