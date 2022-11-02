<template>
  <button
    :class="buttonClasses"
    :disabled="!assessmentsPublicationsStore.upcoming.length"
    @click="assessmentsPublicationsStore.publish"
  >
    Publish assessments
  </button>
</template>

<script setup>
import { computed } from "vue";
import { useWalletStore } from "@/stores/walletStore";
import { useAssessmentPublicationsStore } from "@/stores/assessmentPublicationsStore";

const props = defineProps({
  size: {
    type: String,
    default: "is-normal",
  },
});

const walletStore = useWalletStore();
const assessmentsPublicationsStore = useAssessmentPublicationsStore();

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
