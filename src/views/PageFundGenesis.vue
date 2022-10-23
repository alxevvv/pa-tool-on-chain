<template>
  <div class="section container">
    <h1 class="title">
      Fund Genesis JSON
    </h1>
    <nav
      class="breadcrumb"
      aria-label="breadcrumbs"
    >
      <ul>
        <li>
          <RouterLink :to="{name: 'Funds'}">
            Funds
          </RouterLink>
        </li>
        <li class="is-active">
          <a
            href="#"
            aria-current="page"
          >
            <span v-if="!fundGenesis">
              Fund&nbsp;<span class="has-text-grey">{{ fundHash }}</span>
            </span>
            <span v-else>
              {{ fundGenesis.title }}
            </span>
          </a>
        </li>
      </ul>
    </nav>
    <progress
      v-if="fundsStore.loadFundsRequest.isLoading"
      class="progress is-small is-primary"
      max="100"
    />
    <pre v-else>{{ fundGenesis }}</pre>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useFundsStore } from "@/stores/fundsStore";

const route = useRoute();
const fundsStore = useFundsStore();
const fundHash = route.params.hash;

const fundGenesis = ref(null);

watch(
  () => fundsStore.all,
  () => fundGenesis.value = fundsStore.getByHash(fundHash)?.genesis,
  { immediate: true },
);
</script>
