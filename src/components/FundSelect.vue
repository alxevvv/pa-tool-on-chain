<template>
  <div :class="`select is-${props.size}`">
    <select v-model="fundsStore.selectedFundHash">
      <option value="">
        [please select a fund...]
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

const props = defineProps({
  size: {
    type: String,
    default: "normal",
  },
});

const fundsStore = useFundsStore();
</script>
