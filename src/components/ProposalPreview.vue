<template>
  <div class="proposal-preview">
    <div class="columns is-multiline is-vcentered">
      <div class="column is-10">
        <div class="is-size-6 has-text-weight-bold">
          {{ challenge.title }}
        </div>
        <!-- <RouterLink
          class="is-size-5"
          :to="{ name: 'Proposal', params: { id: proposal.id} }"
        >
          {{ proposal.title }}
        </RouterLink> -->
        <span>
          {{ proposal.title }}
        </span>
        <div class="no">
          No. assessments: {{ numAssessments }}
        </div>
      </div>
      <div class="column is-2">
        <div class="buttons">
          <a
            class="button is-link is-small"
            :href="proposal.url"
            icon-left="link"
            type="is-link"
            target="_blank"
          >
            <span class="icon mr-1">
              <i class="fas fa-link" />
            </span>
            Open in IdeaScale
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import challenges from "@/assets/data/f9/categories.json";

const props = defineProps({
  proposal: {
    type: Object,
    required: true,
  },
});

const challenge = computed(() => {
  const categories = challenges.filter((c) => c.id === parseInt(props.proposal.category));
  if (categories.length) {
    return categories[0];
  }
  return "";
});

const numAssessments = computed(() => {
  return props.proposal.no_assessments || 0;
});
</script>
