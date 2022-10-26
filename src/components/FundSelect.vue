<template>
  <div class="select">
    <select v-model="fundsStore.selectedFundHash">
      <option value="">
        [not selected]
      </option>
      <option
        v-for="fund in fundsStore.selectable"
        :key="fund.hash"
        :value="fund.hash"
      >
        {{ fund.title }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { useFundsStore } from "@/stores/fundsStore";

const fundsStore = useFundsStore();
</script>
