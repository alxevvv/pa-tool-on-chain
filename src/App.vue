<template>
  <div id="nav">
    <RouterLink :to="{ name: 'Home' }">Home</RouterLink> |
    <RouterLink :to="{ name: 'PAStatus' }">PA Status</RouterLink>
  </div>
  <RouterView />
</template>

<style scoped>
@import "bulma/css/bulma.min.css";
</style>
