<template>
  <button
    :class="buttonClasses"
    @click="proposalsStore.suggestNext(false)"
  >
    {{ buttonText }}
  </button>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useProposalsStore } from "@/stores/proposalsStore";

const props = defineProps({
  size: {
    type: String,
    default: "is-normal",
  },
  isLight: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const proposalsStore = useProposalsStore();

const buttonClasses = computed(() => {
  const classes = ["button", "is-primary", props.size];
  if (props.isLight) {
    classes.push("is-light");
  }
  return classes;
});

const buttonText = computed(() => {
  return route.name === "Proposal" ? "Suggest Another Proposal" : "Suggest Proposal";
});
</script>
