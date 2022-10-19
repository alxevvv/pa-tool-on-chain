<template>
  <TheHeader />
  <div class="section container">
    <RouterView />
  </div>
</template>

<script setup>
import TheHeader from "./components/TheHeader.vue";
</script>

<style>
@import "bulma/css/bulma.min.css";
</style>
