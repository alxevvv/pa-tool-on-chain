<template>
  <div class="section container">
    <h1 class="title">
      Assessment submissions
      <span v-if="fundsStore.selectedFund">({{ assessmentSubmissionsStore.countVerbose }})</span>
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

    <article
      v-else-if="fundsStore.isQaDisabled"
      class="message is-warning"
    >
      <div class="message-body">
        <p>
          Quality Assurance disabled for selected fund
        </p>
      </div>
    </article>

    <div
      v-else
      class="block"
    >
      <article
        v-if="fundsStore.isOpenedForAssessmentSubmission"
        class="message is-info"
      >
        <div class="message-body">
          <p>
            Fund is currently open for assessment submissions.
          </p>
          <p>
            Assessment submission period ends on: <b>{{ endDateFormatted }}</b>
          </p>
        </div>
      </article>

      <article
        v-else-if="!fundsStore.isOpenedForAssessmentSubmission"
        class="message is-info"
      >
        <div class="message-body">
          <p>
            Fund is currently close for assessment submissions.
          </p>
          <p>
            Assessment submission period is: <b>{{ periodFormatted }}</b>
          </p>
        </div>
      </article>

      <article
        v-if="fundsStore.isOpenedForAssessmentSubmission && assessmentSubmissionsStore.upcomingCount"
        class="message"
      >
        <div class="message-body">
          <p>
            You have {{ assessmentSubmissionsStore.upcomingCountVerbose }} assessments checked
            for submission. Each submission incurs the Cardano transaction fee (approx. 0.17ada
            repaid as a part of your assessment rewards). Consider submitting all your assessments at once.
          </p>
        </div>
      </article>
    </div>

    <div
      v-if="fundsStore.selectedFund && !fundsStore.isQaDisabled && !isPageLoading"
      class="block box"
    >
      <div class="tabs">
        <ul>
          <li :class="currentTab === 'upcoming' && 'is-active'">
            <a @click="currentTab = 'upcoming'">
              Upcoming ({{ assessmentSubmissionsStore.upcomingAssessments.length }})
            </a>
          </li>
          <li :class="currentTab === 'submitted' && 'is-active'">
            <a @click="currentTab = 'submitted'">
              Submitted ({{ assessmentSubmissionsStore.submittedAssessments.length }})
            </a>
          </li>
        </ul>
      </div>

      <div v-if="currentTab === 'upcoming'">
        <div
          v-if="assessmentSubmissionsStore.upcomingAssessments.length"
          class="table-container"
        >
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th>Id</th>
                <th>Proposal</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="assessment in assessmentSubmissionsStore.upcomingAssessments"
                :key="assessment.proposalId"
              >
                <td>
                  {{ assessment.proposalId }}
                </td>
                <td>
                  <RouterLink :to="{ name: 'Proposal', params: { id: assessment.proposalId }}">
                    {{ assessment.proposalTitle }}
                  </RouterLink>
                </td>
                <td class="is-flex is-justify-content-end">
                  <button
                    class="button is-small is-danger is-outlined"
                    :disabled="walletStore.isTxSubmitting || walletStore.isTxConfirming"
                    @click="assessmentSubmissionsStore.upcomingRemove(assessment.proposalId)"
                  >
                    <span class="icon">
                      <i class="fas fa-minus" />
                    </span>
                    <span>
                      Remove
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="!assessmentSubmissionsStore.upcoming.length"
          class="has-text-centered"
        >
          No assessments for submission
        </div>

        <div
          v-if="fundsStore.isOpenedForAssessmentSubmission"
          class="buttons"
        >
          <WalletConnectButton v-if="!walletStore.isConnected" />
          <ButtonAssessmentsSubmit v-else />
        </div>
      </div>

      <div v-else-if="currentTab === 'submitted'">
        <div
          v-if="assessmentSubmissionsStore.submittedAssessments.length"
          class="table-container"
        >
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th>Id</th>
                <th>Proposal</th>
                <th>Submitted At (UTC)</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="assessment in assessmentSubmissionsStore.submittedAssessments"
                :key="assessment.proposalId"
              >
                <td>
                  {{ assessment.txId }}.{{ assessment.proposalId }}
                </td>
                <td>
                  <RouterLink :to="{ name: 'Proposal', params: { id: assessment.proposalId }}">
                    {{ assessment.proposalTitle }}
                  </RouterLink>
                </td>
                <td>
                  {{ dayjs(assessment.blockTime).format('DD-MM-YYYY, HH:mm') }}
                </td>
                <td class="is-flex is-justify-content-end">
                  <template v-if="!assessmentPublicationsStore.isPublished(assessment.proposalId)">
                    <button
                      v-if="assessmentPublicationsStore.upcoming.includes(assessment.proposalId)"
                      class="button is-small is-primary"
                      :disabled="walletStore.isTxSubmitting || walletStore.isTxConfirming"
                      @click="assessmentPublicationsStore.upcomingRemove(assessment.proposalId)"
                    >
                      <span class="icon">
                        <i class="fas fa-minus" />
                      </span>
                      <span>
                        Remove from publications
                      </span>
                    </button>

                    <button
                      v-else
                      class="button is-small is-primary"
                      :disabled="walletStore.isTxSubmitting || walletStore.isTxConfirming"
                      @click="assessmentPublicationsStore.upcomingAdd(assessment.proposalId)"
                    >
                      <span class="icon">
                        <i class="fas fa-plus" />
                      </span>
                      <span>
                        Add to publications
                      </span>
                    </button>
                  </template>

                  <div
                    v-else
                    class="tags are-small is-flex is-justify-content-end"
                  >
                    <span
                      class="tag is-success"
                    >Published</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-else
          class="has-text-centered"
        >
          No submitted assessments
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { computed, ref } from "vue";
import WalletConnectButton from "@/components/WalletConnectButton.vue";
import ButtonAssessmentsSubmit from "@/components/ButtonAssessmentsSubmit.vue";
import { useFundsStore } from "@/stores/fundsStore";
import { useWalletStore } from "@/stores/walletStore";
import { useAssessmentSubmissionsStore } from "@/stores/assessmentSubmissionsStore";
import { useAssessmentPublicationsStore } from "@/stores/assessmentPublicationsStore";

const fundsStore = useFundsStore();
const walletStore = useWalletStore();
const assessmentSubmissionsStore = useAssessmentSubmissionsStore();
const assessmentPublicationsStore = useAssessmentPublicationsStore();

const isPageLoading = computed(() => {
  return (
    fundsStore.loadFundsRequest?.request?.isLoading ||
    !assessmentSubmissionsStore.loadAssessmentSubmissionsRequest?.request ||
    assessmentSubmissionsStore.loadAssessmentSubmissionsRequest?.request?.isLoading ||
    !assessmentPublicationsStore.loadAssessmentPublicationsRequest?.request ||
    assessmentPublicationsStore.loadAssessmentPublicationsRequest?.request?.isLoading
  );
});

const startDate = computed(() => dayjs(fundsStore.selectedFund?.assessmentSubmissionStartDate));
const endDate = computed(() => dayjs(fundsStore.selectedFund?.assessmentSubmissionEndDate));
const startDateFormatted = computed(() => startDate.value.format("DD-MM-YYYY HH:mm"));
const endDateFormatted = computed(() => endDate.value.format("DD-MM-YYYY HH:mm"));
const periodFormatted = computed(() => `${startDateFormatted.value} – ${endDateFormatted.value}`);

const currentTab = ref("upcoming");
</script>
