<template>
  <TheHeader />
  <BNotifications />
  <RouterView :key="route.fullPath" />
</template>

<script setup>
import { useRoute } from "vue-router";
import TheHeader from "@/components/TheHeader.vue";
import BNotifications from "@/components/BNotifications.vue";
import { useFundsStore } from "@/stores/fundsStore";
import { onMounted } from "vue";

const route = useRoute();

onMounted(useFundsStore().loadFunds);
</script>

<style>
@import "bulma/css/bulma.min.css";
</style>
