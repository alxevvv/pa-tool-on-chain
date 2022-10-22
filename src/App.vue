<template>
  <TheHeader />
  <BNotifications />
  <RouterView />
</template>

<script setup>
import TheHeader from "@/components/TheHeader.vue";
import BNotifications from "@/components/BNotifications.vue";
import { useFundsStore } from "@/stores/fundsStore";
import { onMounted } from "vue";

onMounted(useFundsStore().loadFunds);
</script>

<style>
@import "bulma/css/bulma.min.css";
</style>
