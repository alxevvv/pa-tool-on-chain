<template>
  <label class="mb-2 is-flex is-flex-wrap-wrap">
    <span class="has-text-weight-bold mr-3">Filter proposals by challenge:</span>
    <button
      class="button is-small is-warning is-light"
      @click="proposalsStore.clearFilters"
    >Clear filters</button>
  </label>
  <BMultiSelect
    v-model="proposalsStore.filters.challenges"
    full-width
    clearable
    :empty-item="challengeFilterItems[0].title"
    placeholder="Select a challenge"
    :items="challengeFilterItems.slice(1)"
  />

  <label class="mt-3 mb-2 is-flex is-flex-wrap-wrap">
    <span class="has-text-weight-bold mr-3">Filter by title:</span>
  </label>
  <div class="field">
    <p class="control has-icons-left">
      <input
        v-model="proposalsStore.filters.title"
        class="input"
        type="text"
        placeholder="Search for (min 3 char)..."
      >
      <span class="icon is-small is-left">
        <i class="fas fa-search" />
      </span>
    </p>
  </div>

  <label class="mt-3 mb-2 is-flex is-flex-wrap-wrap">
    <span class="has-text-weight-bold mr-3">Filter proposals by tag:</span>
  </label>
  <BMultiSelect
    v-model="proposalsStore.filters.tags"
    full-width
    clearable
    placeholder="Select a tag"
    :items="tagFilterItems"
  />

  <div class="columns mt-1">
    <div class="column is-half">
      <label class="mb-2 is-flex is-flex-wrap-wrap">
        <span class="has-text-weight-bold mr-3">Filter proposals budget is more than:</span>
      </label>
      <div class="field">
        <p class="control">
          <input
            v-model="proposalsStore.filters.minPrice"
            class="input has-text-centered"
            type="number"
            :min="0"
            :max="Number.MAX_SAFE_INTEGER"
            :step="1000"
          >
        </p>
      </div>
    </div>

    <div class="column is-half">
      <label class="mb-2 is-flex is-flex-wrap-wrap">
        <span class="has-text-weight-bold mr-3">Filter proposals budget is less than:</span>
      </label>
      <div class="field">
        <p class="control">
          <input
            v-model="proposalsStore.filters.maxPrice"
            class="input has-text-centered"
            type="number"
            :min="0"
            :max="Number.MAX_SAFE_INTEGER"
            :step="1000"
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useChallengesStore } from "@/stores/challengesStore";
import { useProposalsStore } from "@/stores/proposalsStore";
import BMultiSelect from "./BMultiSelect.vue";

const challengesStore = useChallengesStore();
const proposalsStore = useProposalsStore();

const challengeFilterItems = computed(() => {
  return challengesStore.all.map(({ id, title, count }) => ({ id, title: `${title} (${count})` }));
});

const tagFilterItems = computed(() => {
  return proposalsStore.tagsList.map((tag) => ({ id: tag, title: tag }));
});
</script>
