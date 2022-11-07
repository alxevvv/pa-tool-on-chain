<template>
  <Teleport to="body">
    <div class="b-notifications">
      <div class="is-flex is-flex-direction-column is-justify-content-flex-start is-align-items-center">
        <div
          v-for="n in notificationsStore.list"
          :key="n.uuid"
          :class="getClasses(n)"
          @mouseenter="notificationsStore.unsetClosingDelay(n.uuid)"
        >
          <button
            class="delete"
            @click="notificationsStore.close(n.uuid)"
          />

          <template v-if="Array.isArray(n.text)">
            <p
              v-for="line in n.text"
              :key="line"
            >
              {{ line }}
            </p>
          </template>

          <p v-else>
            {{ n.text }}
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useNotificationsStore } from "@/stores/notificationsStore";

const notificationsStore = useNotificationsStore();

function getClasses(n) {
  const classes = ["notification", "mb-3"];
  if (n.type) {
    classes.push(n.type);
  }
  return classes;
}
</script>

<style scoped>
.b-notifications {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: none;
  z-index: 50;
  pointer-events: none;
  padding: 1.5rem;
}

.b-notifications .notification {
  pointer-events: auto;
}
</style>
