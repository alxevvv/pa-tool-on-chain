<template>
  <label class="mb-2 is-flex is-flex-wrap-wrap">
    <span class="has-text-weight-bold mr-3">Filter proposals by challenge:</span>
  </label>
  <BMultiSelect
    v-model="selectedDropdownItems"
    full-width
    clearable
    :empty-item="challengesSelectItems[0].title"
    placeholder="Select a challenge"
    :items="challengesSelectItems.slice(1)"
  />
  <label class="mt-3 mb-2 is-flex is-flex-wrap-wrap">
    <span class="has-text-weight-bold mr-3">Filter by title:</span>
  </label>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useChallengesStore } from "@/stores/challengesStore";
import BMultiSelect from "./BMultiSelect.vue";

const challengesStore = useChallengesStore();

const selectedDropdownItems = ref([]);

const challengesSelectItems = computed(() => {
  return challengesStore.all.map(({ id, title, count }) => ({ id, title: `${title} (${count})` }));
});

watch(() => selectedDropdownItems.value.map(({ id }) => id).join(":"), (items) => {
  console.log(items);
});
</script>
