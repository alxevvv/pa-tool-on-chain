<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="section container">
    <h1
      v-if="proposal"
      class="title"
    >
      {{ proposal.title }}
    </h1>
    <h2
      v-if="challenge"
      class="subtitle"
    >
      {{ challenge.title }}
    </h2>

    <progress
      v-if="isPageLoading"
      class="progress is-small is-primary"
      max="100"
    />

    <template v-else>
      <nav
        class="breadcrumb"
        aria-label="breadcrumbs"
      >
        <ul>
          <li>
            <RouterLink :to="{name: 'Proposals'}">
              Proposals
            </RouterLink>
          </li>
          <li class="is-active">
            <a
              href="#"
              aria-current="page"
            >
              {{ proposal.title }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="block box">
        <h6 class="title is-6">
          <span class="has-text-weight-normal">Author:</span> {{ proposal.author }}
        </h6>

        <div class="mb-4">
          <h4 class="title is-5 mb-1">
            {{ isChallengeSetting ? 'Challenge question' : 'Problem statement' }} (max 140 char)
          </h4>
          <div v-html="proposal.description" />
        </div>

        <div
          v-if="proposal.problem_solution"
          class="mb-4"
        >
          <h4 class="title is-5 mb-1">
            Problem solution (max 140 char)
          </h4>
          <div v-html="proposal.problem_solution" />
        </div>

        <div
          v-if="proposal.relevant_experience"
          class="mb-4"
        >
          <h4 class="title is-5 mb-1">
            Relevant experience (max 140 char)
          </h4>
          <div v-html="proposal.relevant_experience" />
        </div>

        <div
          v-if="proposal.importance"
          class="mb-4"
        >
          <h4 class="title is-5 mb-1">
            Why is it important? (max 140 char)
          </h4>
          <div v-html="proposal.importance" />
        </div>

        <div
          v-if="proposal.how_does_success_look_like_"
          class="mb-4"
        >
          <h4 class="title is-5 mb-1">
            How does success look like? (max 140 char)
          </h4>
          <div v-html="proposal.how_does_success_look_like_" />
        </div>

        <div
          v-if="proposal.requested_funds"
          class="mb-4"
        >
          Requested funds: <b>{{ proposal.requested_funds }}</b>
        </div>

        <div
          v-if="proposal.requested_funds_coti"
          class="mb-4"
        >
          Requested funds: <b>{{ proposal.requested_funds_coti }}</b>
        </div>

        <div>
          <span>
            <span class="mr-1">
              No. assessments:
            </span>
            <b>
              {{ proposal.assessments_count }}
            </b>
          </span>

          <br>

          <span class="is-size-7">
            <span class="mr-1">
              Stats last update:
            </span>
            <span>
              {{ proposalsStore.lastUpdateDuration }}
              [{{ proposalsStore.lastUpdateVerbose }}]
            </span>
          </span>
        </div>
      </div>

      <div class="block box">
        <div class="buttons">
          <a
            class="button is-medium is-link mr-4"
            :href="proposal.url"
            target="_blank"
          >
            <span class="icon">
              <i class="fas fa-eye" />
            </span>
            <span>Go to proposal</span>
          </a>

          <SuggestProposalButton size="is-medium" />
        </div>
      </div>

      <div class="block box">
        <ProposalAssessment :proposal="proposal" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import ProposalAssessment from "@/components/ProposalAssessment.vue";
import SuggestProposalButton from "@/components/SuggestProposalButton.vue";
import { useProposalsStore } from "@/stores/proposalsStore";
import { useAssessmentSubmissionsStore } from "@/stores/assessmentSubmissionsStore";
import challenges from "@/assets/data/f9/categories.json";

const route = useRoute();
const proposalsStore = useProposalsStore();
const assessmentSubmissionsStore = useAssessmentSubmissionsStore();

const proposalId = parseInt(route.params.id);

const proposal = computed(() => {
  return proposalsStore.all.find(({ id }) => id === proposalId);
});

const challenge = computed(() => {
  if (!proposal.value) {
    return null;
  }
  return challenges.find((c) => c.id === proposal.value.category);
});

const isChallengeSetting = computed(() => {
  return challenge.value?.id === 26257;
});

const isPageLoading = computed(() => {
  return (
    !proposal.value ||
    !challenge.value ||
    !assessmentSubmissionsStore.loadAssessmentSubmissionsRequest?.request ||
    assessmentSubmissionsStore.loadAssessmentSubmissionsRequest?.request?.isLoading
  );
});
</script>
