<template>
  <label class="mb-2 is-flex is-flex-wrap-wrap">
    <span class="has-text-weight-bold mr-3">Filter proposals by challenge:</span>
    <button
      class="button is-small is-warning is-light"
      @click="clearFilters"
    >Clear filters</button>
  </label>
  <BMultiSelect
    v-model="challengeFilter"
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
        v-model="titleFilter"
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
    v-model="tagFilter"
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
            v-model="maxPrice"
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
            v-model="minPrice"
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
import { computed, ref/* , watch */ } from "vue";
import { useChallengesStore } from "@/stores/challengesStore";
import BMultiSelect from "./BMultiSelect.vue";

const challengesStore = useChallengesStore();

const challengeFilter = ref([]);
const titleFilter = ref("");
const tagFilter = ref([]);
const maxPrice = ref("0");
const minPrice = ref("0");

const challengeFilterItems = computed(() => {
  return challengesStore.all.map(({ id, title, count }) => ({ id, title: `${title} (${count})` }));
});

const tagFilterItems = computed(() => {
  return challengesStore.tagsList.map((tag) => ({ id: tag, title: tag }));
});

function clearFilters() {
  challengeFilter.value = [];
  titleFilter.value = "";
  tagFilter.value = [];
  maxPrice.value = "0";
  minPrice.value = "0";
}

// watch(() => challengeFilter.value.map(({ id }) => id).join(":"), (items) => {
//   console.log(items);
// });

// watch(() => tagFilter.value.map(({ id }) => id).join(":"), (items) => {
//   console.log(items);
// });
</script>
