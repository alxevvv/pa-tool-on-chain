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
        <a
          class="dropdown-item"
          @click="walletInfoModalIsActive = true"
        >
          Wallet info
        </a>
        <a
          class="dropdown-item"
          @click="walletStore.selectWallet('')"
        >
          Disconnect
        </a>
      </div>
    </div>
  </div>


  <BModal
    title="Connected wallet info"
    :is-active="walletInfoModalIsActive"
    @close="walletInfoModalIsActive = false"
  >
    <div class="wallet-info-modal has-text-centered">
      <h4 class="is-size-5">
        {{ walletStore.walletProps.name }}
      </h4>
      <figure>
        <img
          :src="walletStore.walletProps.icon"
          alt="Wallet icon"
          width="100"
        >
      </figure>
      <p>
        <b>API version</b>: {{ walletStore.walletProps.apiVersion }}
      </p>
      <p>
        <b>Network ID</b>: {{ walletStore.walletProps.networkId }}
      </p>
      <p v-if="walletStore.walletProps.stakeAddress">
        <b>Stake address</b>: <code>{{ walletStore.walletProps.stakeAddress }}</code>
      </p>
    </div>
    <template #footer>
      <button
        class="button is-primary"
        @click="walletInfoModalIsActive = false"
      >
        OK
      </button>
      <button
        class="button is-danger is-outlined"
        @click="disconnectWallet"
      >
        Disconnect
      </button>
    </template>
  </BModal>
</template>

<script setup>
import { computed, ref } from "vue";
import { useWalletStore } from "@/stores/walletStore";
import BModal from "@/components/BModal.vue";

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

const walletInfoModalIsActive = ref(false);

function disconnectWallet() {
  walletInfoModalIsActive.value = false;
  walletStore.selectWallet("");
}
</script>
