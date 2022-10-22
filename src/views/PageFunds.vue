<template>
  <div class="section container">
    <h1 class="title">
      Funds
    </h1>
    <div class="block">
      <progress
        v-if="fundsStore.loadFundsRequest.isLoading"
        class="progress is-small is-primary"
        max="100"
      />

      <div
        v-else-if="fundsStore.all.length"
        class="table-container"
      >
        <table class="table is-fullwidth">
          <thead>
            <tr>
              <th>Hash</th>
              <th>Title</th>
              <th>Status</th>
              <th>Current Stages</th>
              <th>PA Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in tableRows"
              :key="row.fundHash"
            >
              <td>
                <RouterLink :to="{name: 'FundGenesis', params: {hash: row.fundHash}}">
                  {{ row.fundHashCompact }}
                </RouterLink>
              </td>
              <td>
                {{ row.title }}
              </td>
              <td>{{ row.status }}</td>
              <td>
                <template v-if="row.actions.length">
                  <span
                    v-for="action in row.actions"
                    :key="action"
                    class="tag is-primary is-light mr-1"
                  >{{ action }}</span>
                </template>
                <template v-else>
                  <span class="tag is-white">&ndash;</span>
                </template>
              </td>
              <td>PA Status</td>
            </tr>
          </tbody>
        </table>
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
import { ref, watch } from "vue";
import { useFundsStore } from "@/stores/fundsStore";
import { fundStatus, fundCurrentStages } from "@/utils/fundsUtils";

const fundsStore = useFundsStore();

const tableRows = ref([]);

function fundsToTableRows() {
  return fundsStore.all.map((fund) => {
    return {
      fundHash: fund.fundHash,
      fundHashCompact: fund.fundHashCompact,
      title: fund.title,
      status: fundStatus(fund),
      actions: fundCurrentStages(fund),
    };
  });
}

watch(
  () => fundsStore.all,
  () => tableRows.value = fundsToTableRows(),
  { immediate: true },
);
</script>
