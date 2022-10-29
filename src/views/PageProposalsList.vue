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

      <div class="block box">
        <p
          v-if="proposalsStore.filteredProposals.length === 0"
          class="is-size-4"
        >
          <span>
            No results for current selection. Please adjust the filter criteria.
          </span>
        </p>

        <template v-else>
          <ProposalPreview
            v-for="proposal in proposalsStore.filteredProposals"
            :key="`proposal-${proposal.id}`"
            :proposal="proposal"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useFundsStore } from "@/stores/fundsStore";
import { useProposalsStore } from "@/stores/proposalsStore";
import ProposalsFilter from "@/components/ProposalsFilter.vue";
import ProposalPreview from "@/components/ProposalPreview.vue";

const fundsStore = useFundsStore();
const proposalsStore = useProposalsStore();

const isPageLoading = computed(() => {
  return fundsStore.loadFundsRequest?.request?.isLoading;
});
</script>
