<template>
  <div class="section container">
    <h1 class="title is-spaced">
      Proposal Assessor Status
    </h1>

    <progress
      v-if="fundsStore.loadFundsRequest?.request?.isLoading"
      class="progress is-small is-primary"
      max="100"
    />

    <template v-else-if="fundsStore.selectedFund">
      <h2 class="subtitle">
        Selected Fund:
      </h2>

      <div class="card selected-fund-card">
        <h3 class="card-header-title title is-5">
          {{ fundsStore.selectedFund.title }}
        </h3>

        <div class="card-content">
          <div class="content">
            <div class="block">
              <strong>PA Status:</strong>&nbsp;
              <FundPaStatus
                with-time
                :fund-hash="fundsStore.selectedFundHash"
              />
              <template v-if="fundsStore.isPaRegistered">
                <br>
                <strong>PA Registration Tx Hash:</strong>&nbsp;
                <code>{{ fundsStore.paRegistration.txHash }}</code>
              </template>
            </div>

            <div class="block">
              <strong>Fund hash:</strong>&nbsp;
              <code>{{ fundsStore.selectedFundHash }}</code>
              <br>
              <strong>Genesis Tx hash:</strong>&nbsp;
              <code>{{ fundsStore.selectedFund.txHash }}</code>
              <br>
              <strong>Activity period:</strong>&nbsp;
              {{ fundsStore.selectedFund.activityPeriod }}
              <br>
              <strong>Has community QA stage:</strong>&nbsp;
              {{ fundsStore.selectedFund.qaStageVerbose }}
              <br>
              <strong>Current stage(s):</strong>&nbsp;
              <template v-if="fundsStore.selectedFund.currentStages.length">
                <span
                  v-for="action in fundsStore.selectedFund.currentStages"
                  :key="action"
                  class="mr-1"
                >{{ action }}</span>
              </template>
              <template v-else>
                <span class="tag is-white">&ndash;</span>
              </template>
            </div>

            <div class="block">
              <h4 class="title is-6">
                Genesis JSON:
              </h4>
              <pre>{{ fundsStore.selectedFund.genesis }}</pre>
              <div class="block buttons">
                <button
                  class="button is-info"
                  @click="copyToClipboard"
                >
                  <span class="icon is-small">
                    <i class="fas fa-clipboard" />
                  </span>
                  <span>Copy to clipboard</span>
                </button>
                <button
                  class="button is-info"
                  @click="saveToFile"
                >
                  <span class="icon is-small">
                    <i class="fas fa-file-download" />
                  </span>
                  <span>Save to file</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <article
      v-else
      class="message is-warning"
    >
      <div class="message-body">
        <p>
          No selected fund
        </p>
      </div>
    </article>
  </div>
</template>

<script setup>
import FundPaStatus from "@/components/FundPaStatus.vue";
import useClipboard from "@/composables/useClipboard";
import useDownload from "@/composables/useDownload";
import { useFundsStore } from "@/stores/fundsStore";

const clipboard = useClipboard();
const download = useDownload();
const fundsStore = useFundsStore();

function copyToClipboard() {
  if (fundsStore.selectedFund) {
    clipboard.copy(JSON.stringify(fundsStore.selectedFund.genesis, null, 2));
  }
}

function saveToFile() {
  if (fundsStore.selectedFund) {
    download.toJson(fundsStore.selectedFund.genesis, fundsStore.selectedFund.genesis.title);
  }
}
</script>

<style>
.selected-fund-card > .title {
  margin-bottom: 0;
}
</style>
