import { v4 as uuidv4 } from "uuid";
import { defineStore } from "pinia";
import { readonly, ref } from "vue";

const defaultOptions = {
  text: "",
  type: "",
  duration: 3000,
};

// TODO: notifications shortcuts (info, success, warning, danger, error)
export const useNotificationsStore = defineStore(
  "notifications",
  () => {
    const list = ref([]);
    const closingDelays = ref({});

    function add(options = {}) {
      const notification = {
        uuid: uuidv4(),
        ...defaultOptions,
        ...options,
      };
      list.value.push(notification);
      if (notification.duration) {
        setClosingDelay(notification.uuid, notification.duration);
      }
    }

    function setClosingDelay(uuid, duration) {
      closingDelays.value[uuid] = {
        duration,
        timeout: setTimeout(() => close(uuid), duration),
      };
    }

    function unsetClosingDelay(uuid) {
      const timeout = closingDelays.value[uuid]?.timeout;
      if (timeout) {
        clearTimeout(timeout);
        delete closingDelays.value[uuid];
      }
    }

    function close(uuid) {
      const index = list.value.findIndex((n) => n.uuid === uuid);
      if (index !== -1) {
        unsetClosingDelay(uuid);
        list.value.splice(index, 1);
      }
    }

    return {
      list: readonly(list),
      add,
      close,
      setClosingDelay,
      unsetClosingDelay,
    };
  },
  { persist: false },
);
