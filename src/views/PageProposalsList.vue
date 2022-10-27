<template>
  <div class="section container">
    <h1 class="title">
      Proposals List
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

    <div v-else>
      <div class="block">
        <ProposalsFilter />
      </div>
      <!-- <div class="block">
        LIST
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useFundsStore } from "@/stores/fundsStore";
import { useChallengesStore } from "@/stores/challengesStore";
import { useProposalsStore } from "@/stores/proposalsStore";
import ProposalsFilter from "@/components/ProposalsFilter.vue";

const fundsStore = useFundsStore();
const challengesStore = useChallengesStore();
const proposalsStore = useProposalsStore();

const isPageLoading = computed(() => {
  return fundsStore.loadFundsRequest?.request?.isLoading;
});
</script>
