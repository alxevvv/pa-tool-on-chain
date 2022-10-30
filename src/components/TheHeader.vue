<template>
  <nav
    class="navbar is-primary"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-brand">
      <RouterLink
        :to="{ name: 'Home' }"
        class="navbar-item"
      >
        <img
          src="../assets/images/catalyst.png"
          alt="Project Catalyst"
        >
      </RouterLink>

      <a
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </a>
    </div>

    <div
      id="navbarBasicExample"
      class="navbar-menu"
    >
      <div class="navbar-start">
        <span class="navbar-item">
          <WalletConnectButton is-light />
        </span>
      </div>

      <div class="navbar-end">
        <div class="navbar-item has-dropdown is-hoverable">
          <span class="navbar-link">On-chain Details</span>
          <div class="navbar-dropdown is-right is-boxed">
            <RouterLink
              :to="{ name: 'Funds' }"
              :class="navbarItemClasses('Funds')"
            >
              Funds
            </RouterLink>
            <RouterLink
              :to="{ name: 'PAStatus' }"
              :class="navbarItemClasses('PAStatus')"
            >
              PA Status
            </RouterLink>
          </div>
        </div>

        <div class="navbar-item has-dropdown is-hoverable">
          <span class="navbar-link">Proposals</span>
          <div class="navbar-dropdown is-right is-boxed">
            <RouterLink
              :to="{ name: 'Proposals' }"
              :class="navbarItemClasses('Proposals')"
            >
              List
            </RouterLink>
            <a
              class="navbar-item"
              @click.prevent="proposalsStore.suggestNext(false)"
            >
              Suggest next proposal
            </a>
          </div>
        </div>

        <div class="navbar-item has-dropdown is-hoverable">
          <span class="navbar-link">PA Resources</span>
          <div class="navbar-dropdown is-right is-boxed">
            <a
              class="navbar-item"
              target="_blank"
              href="https://www.youtube.com/playlist?list=PLDLKmC_jWczVff7Gv6J5nmKLl52mVCT9q"
            >Catalyst School workshops
              for PAs</a>
            <a
              class="navbar-item"
              target="_blank"
              href="https://docs.google.com/document/d/1g-iZhDlKhUBZkui1uv8NVNfJC4oVD3JtR-P6Fue7XPU"
            >PA Guide</a>
            <a
              class="navbar-item"
              target="_blank"
              href="https://t.me/CatalystCommunityAdvisors"
            >Telegram PAs chat</a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useProposalsStore } from "@/stores/proposalsStore";
import WalletConnectButton from "@/components/WalletConnectButton.vue";

const route = useRoute();
const proposalsStore = useProposalsStore();

function navbarItemClasses(routeName) {
  return `navbar-item${route.name === routeName ? " is-active" : ""}`;
}
</script>

<style scoped>
.navbar-brand .navbar-item {
  background: transparent !important;
}
</style>
