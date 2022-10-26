<template>
  <div class="section container">
    <h1 class="title">
      Funds
    </h1>

    <div class="block">
      <progress
        v-if="fundsStore.loadFundsRequest.request?.isLoading"
        class="progress is-small is-primary"
        max="100"
      />

      <div v-else-if="fundsStore.all.length">
        <div class="block">
          <FundSelect />
        </div>
        <div class="table-container">
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th>Hash</th>
                <th>Title</th>
                <th>Activity</th>
                <th>QA</th>
                <th>Stage(s)</th>
                <th>PA Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="fund in fundsStore.all"
                :key="fund.metadataId"
                :class="fund.fundHash === fundsStore.selectedFundHash && 'is-selected'"
              >
                <td>
                  <RouterLink :to="{name: 'FundGenesis', params: {hash: fund.fundHash}}">
                    {{ fund.fundHashCompact }}
                  </RouterLink>
                </td>
                <td>
                  {{ fund.title }}
                </td>
                <td>{{ fund.activityPeriod }}</td>
                <td>
                  <span class="tag is-light">
                    {{ fund.qaStageVerbose }}
                  </span>
                </td>
                <td>
                  <template v-if="fund.currentStages.length">
                    <span
                      v-for="action in fund.currentStages"
                      :key="action"
                      class="tag is-primary is-light mr-1"
                    >{{ action }}</span>
                  </template>
                  <template v-else>
                    <span class="tag is-white">&ndash;</span>
                  </template>
                </td>
                <td>
                  <FundPaStatus :fund-hash="fund.fundHash" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-else
        class="has-text-centered is-size-5"
      >
        No funds found
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFundsStore } from "@/stores/fundsStore";
import FundSelect from "@/components/FundSelect.vue";
import FundPaStatus from "@/components/FundPaStatus.vue";

const fundsStore = useFundsStore();
</script>
