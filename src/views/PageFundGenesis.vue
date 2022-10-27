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
      v-if="fundsStore.loadFundsRequest?.request?.isLoading"
      class="progress is-small is-primary"
      max="100"
    />
    <div v-else>
      <pre class="block">{{ fundGenesis }}</pre>

      <div class="block buttons">
        <button
          class="button is-info"
          @click="clipboard.copy(JSON.stringify(fundGenesis, null, 2))"
        >
          <span class="icon is-small">
            <i class="fas fa-clipboard" />
          </span>
          <span>Copy to clipboard</span>
        </button>
        <button
          class="button is-info"
          @click="download.toJson(fundGenesis, fundGenesis.title)"
        >
          <span class="icon is-small">
            <i class="fas fa-file-download" />
          </span>
          <span>Save to file</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useFundsStore } from "@/stores/fundsStore";
import useClipboard from "@/composables/useClipboard";
import useDownload from "@/composables/useDownload";

const route = useRoute();
const fundsStore = useFundsStore();
const clipboard = useClipboard();
const download = useDownload();

const fundHash = route.params.hash;
const fundGenesis = ref(null);

watch(
  () => fundsStore.all,
  () => fundGenesis.value = fundsStore.getByHash(fundHash)?.genesis,
  { immediate: true },
);
</script>
