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
            <span v-if="!fund">
              Fund&nbsp;<span class="has-text-grey">{{ fundHash }}</span>
            </span>
            <span v-else>
              {{ fund.title }}
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
    <pre v-else>
      {{ fund }}
    </pre>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useFundsStore } from "@/stores/fundsStore";

const route = useRoute();
const fundsStore = useFundsStore();
const fundHash = route.params.hash;

const fund = ref(null);

watch(
  () => fundsStore.all,
  () => fund.value = fundsStore.getByHash(fundHash),
  { immediate: true },
);
</script>
