<template>
  <div
    v-once
    class="proposal-preview"
  >
    <div class="columns is-multiline is-vcentered">
      <div class="column is-10">
        <div class="is-size-6 has-text-weight-bold">
          {{ challengesStore.titlesById[proposal.category] }}
        </div>

        <RouterLink
          class="is-size-5"
          :to="{ name: 'Proposal', params: { id: props.proposal.id } }"
        >
          {{ props.proposal.title }}
        </RouterLink>

        <div class="no">
          No. assessments:
          <span>
            {{ props.proposal.assessments_count }}
          </span>
        </div>
      </div>

      <div class="column is-2">
        <div class="buttons">
          <a
            class="button is-link is-small"
            :href="props.proposal.url"
            target="_blank"
          >
            <span class="icon">
              <i class="fas fa-link" />
            </span>
            <span>
              Open in IdeaScale
            </span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useChallengesStore } from "@/stores/challengesStore";

const props = defineProps({
  proposal: {
    type: Object,
    required: true,
  },
});

const challengesStore = useChallengesStore();
</script>

<style>
.proposal-preview {
  padding: 10px 20px;
  width: 100%;
}

.proposal-preview:nth-child(odd) {
  background: #f1f1f1;
}
</style>
