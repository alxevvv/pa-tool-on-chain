<template>
  <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <RouterLink :to="{ name: 'Home' }" class="navbar-item">
        <img src="../assets/images/catalyst.png" alt="Project Catalyst" />
      </RouterLink>

      <a
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu">
      <div class="navbar-start">
        <RouterLink :to="{ name: 'Home' }" :class="linkClasses('Home')">Home</RouterLink>
        <RouterLink :to="{ name: 'PAStatus' }" :class="linkClasses('PAStatus')">PA Status</RouterLink>

        <!-- <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link"> More </a>

          <div class="navbar-dropdown">
            <a class="navbar-item"> About </a>
            <a class="navbar-item"> Jobs </a>
            <a class="navbar-item"> Contact </a>
            <hr class="navbar-divider" />
            <a class="navbar-item"> Report an issue </a>
          </div>
        </div> -->
      </div>

      <div class="navbar-end">
        <!-- <div class="navbar-item">
          <div class="buttons">
            <a class="button is-primary">
              <strong>Sign up</strong>
            </a>
            <a class="button is-light"> Log in </a>
          </div>
        </div> -->
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

function linkClasses(routeName) {
  return `navbar-item${route.name === routeName ? " is-active" : ""}`;
}
</script>

<style scoped>
.navbar-brand .navbar-item {
  background: transparent !important;
}
</style>
