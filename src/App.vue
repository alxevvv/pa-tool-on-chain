<template>
  <TheHeader />
  <BNotifications />
  <RouterView />
</template>

<script setup>
import TheHeader from "@/components/TheHeader.vue";
import BNotifications from "@/components/BNotifications.vue";
</script>

<style>
@import "bulma/css/bulma.min.css";
</style>
