<template>
  <template
    v-if="!walletStore.isConnected"
  >
    <button
      v-if="walletStore.availableWallets.length === 0"
      :class="buttonClasses"
    >
      <!-- TODO: Show info what wallets are compatible -->
      No Cardano wallets detected
    </button>

    <button
      v-else-if="walletStore.availableWallets.length === 1"
      :class="buttonClasses"
      @click="walletStore.selectWallet(walletStore.availableWallets[0])"
    >
      Connect Cardano wallet
    </button>

    <div
      v-else-if="walletStore.availableWallets.length > 1"
      class="dropdown is-hoverable"
    >
      <div class="dropdown-trigger">
        <button
          :class="buttonClasses"
          aria-haspopup="true"
          aria-controls="dropdown-menu4"
        >
          <span>{{ buttonText }}</span>
          <span class="icon is-small">
            <i
              class="fas fa-angle-down"
              aria-hidden="true"
            />
          </span>
        </button>
      </div>
      <div
        v-if="!walletStore.isConnecting"
        class="dropdown-menu"
        role="menu"
      >
        <div class="dropdown-content">
          <a
            v-for="walletKey in walletStore.availableWallets"
            :key="walletKey"
            class="dropdown-item"
            @click="walletStore.selectWallet(walletKey)"
          >
            {{ walletKey }}
          </a>
        </div>
      </div>
    </div>
  </template>

  <div
    v-else
    class="dropdown is-hoverable"
  >
    <div class="dropdown-trigger">
      <button
        :class="buttonClasses"
        aria-haspopup="true"
        aria-controls="dropdown-menu4"
      >
        <span> Wallet connected ({{ walletStore.selectedWalletKey }})</span>
        <span class="icon is-small">
          <i
            class="fas fa-angle-down"
            aria-hidden="true"
          />
        </span>
      </button>
    </div>
    <div
      class="dropdown-menu"
      role="menu"
    >
      <div class="dropdown-content">
        <!-- TODO: Connected wallet info -->
        <a
          class="dropdown-item"
          @click="walletStore.selectWallet('')"
        >
          Disconnect
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useWalletStore } from "../stores/walletStore";

const props = defineProps({
  size: {
    type: String,
    default: "is-normal",
  },
  isLight: {
    type: Boolean,
    default: false,
  },
});

const walletStore = useWalletStore();

const buttonClasses = computed(() => {
  const classes = ["button", props.size];
  if (props.isLight) {
    classes.push("is-light");
  }
  if (walletStore.isConnecting) {
    classes.push("is-loading");
  }
  if (walletStore.isConnected) {
    classes.push("is-success");
  } else {
    if (walletStore.availableWallets.length) {
      classes.push("is-warning");
    } else {
      classes.push("is-danger");
    }
  }
  return classes;
});

const buttonText = computed(() => {
  return walletStore.isConnected
    ? `Cardano wallet connected (${walletStore.selectedWalletKey})`
    : "Connect Cardano wallet";
});
</script>
