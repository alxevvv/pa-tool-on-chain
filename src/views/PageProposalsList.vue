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

      <div
        ref="proposalPreviewsContainerElement"
        class="proposal-previews-conainer block box"
      >
        <div
          v-if="proposalsStore.filteredProposals.length === 0"
          class="is-size-4 is-flex is-justify-content-center"
        >
          <p
            v-if="proposalsStore.isNotFiltered"
            class="icon-text"
          >
            <span class="icon">
              <i class="fas fa-spinner fa-pulse mr-1" />
              <span>Loading...</span>
            </span>
          </p>

          <p v-else>
            No results for current selection. Please adjust the filter criteria.
          </p>
        </div>

        <template v-else>
          <ProposalPreview
            v-for="proposal in proposalsStore.paginatedProposals"
            :key="`proposal-${proposal.id}`"
            :proposal="proposal"
          />

          <hr
            ref="pageEndObservedElement"
            class="page-end-observer"
          >
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from "vue";
import { useFundsStore } from "@/stores/fundsStore";
import { useProposalsStore } from "@/stores/proposalsStore";
import ProposalsFilter from "@/components/ProposalsFilter.vue";
import ProposalPreview from "@/components/ProposalPreview.vue";

const fundsStore = useFundsStore();
const proposalsStore = useProposalsStore();

const isPageLoading = computed(() => {
  return fundsStore.loadFundsRequest?.request?.isLoading;
});

const proposalPreviewsContainerElement = ref(null);
const pageEndObservedElement = ref(null);

const pageEndObserver = new IntersectionObserver(pageEndObserverCallback, {
  threshold: 0,
});

function pageEndObserverCallback(entries) {
  if (entries[0]?.isIntersecting) {
    let chunkSize;
    const containerBoundingClientRect = proposalPreviewsContainerElement.value.getBoundingClientRect();
    const containerY = containerBoundingClientRect.y + 20;
    const windowHeight = window.innerHeight;
    const proposalPreview = proposalPreviewsContainerElement.value.querySelector(".proposal-preview");
    const proposalPreviewHeight = proposalPreview.clientHeight;

    if (containerY > 0) {
      chunkSize = Math.ceil((windowHeight - containerY) / proposalPreviewHeight * 2);
    } else {
      chunkSize = Math.ceil(windowHeight / proposalPreviewHeight * 2);
    }

    proposalsStore.endlessPaginationShowNextChunk(chunkSize);
  }
}

watch(pageEndObservedElement, (element) => {
  if (element) {
    pageEndObserver.observe(pageEndObservedElement.value);
  }
});

onUnmounted(() => pageEndObserver.disconnect());
</script>

<style scoped>
.page-end-observer {
  margin-bottom: 0.5rem;
}
</style>
