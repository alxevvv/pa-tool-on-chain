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
          @click="copyGenesisToClipboard"
        >
          <span class="icon is-small">
            <i class="fas fa-clipboard" />
          </span>
          <span>Copy to clipboard</span>
        </button>
        <button
          class="button is-info"
          @click="saveGenesisToFile"
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
import { useNotificationsStore } from "@/stores/notificationsStore";
import saveToFile from "@/utils/saveToFile";

const route = useRoute();
const fundsStore = useFundsStore();
const notificationsStore = useNotificationsStore();

const fundHash = route.params.hash;
const fundGenesis = ref(null);

async function copyGenesisToClipboard() {
  if (!fundGenesis.value) {
    return;
  }
  try {
    await navigator.clipboard.writeText(JSON.stringify(fundGenesis.value, null, 2));
    notificationsStore.add({
      type: "is-success",
      text: "Fund Genesis JSON copied to clipboard",
      duration: 2000,
    });
  } catch (err) {
    notificationsStore.add({
      type: "is-danger",
      text: `Error copying to clipboard: ${err.toString()}`,
      duration: 5000,
    });
  }
}

function saveGenesisToFile() {
  if (!fundGenesis.value) {
    return;
  }
  saveToFile(
    JSON.stringify(fundGenesis.value, null, 2),
    `${fundGenesis.value.title}.json`,
    "application/json",
  );
}

watch(
  () => fundsStore.all,
  () => fundGenesis.value = fundsStore.getByHash(fundHash)?.genesis,
  { immediate: true },
);
</script>
