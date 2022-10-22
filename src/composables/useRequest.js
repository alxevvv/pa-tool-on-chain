import { ref, watch } from "vue";
import { useRequestsStore } from "@/stores/requestsStore";
import { useNotificationsStore } from "@/stores/notificationsStore";

export default function useRequest(rq, ...args) {
  const requestsStore = useRequestsStore();
  const notificationsStore = useNotificationsStore();

  const request = ref(null);
  const url = ref(rq(...args));

  watch(
    () => requestsStore.requests[url.value]?.isLoading,
    () => {
      const storedRequest = requestsStore.requests[url.value];
      if (storedRequest) {
        request.value = storedRequest;
        if (request.value.isFailed) {
          notificationsStore.add({
            type: "is-danger",
            text: `Request error: ${request.value.error?.data?.message}` || "Unknown request error",
          });
        }
      }
    },
    {
      immediate: true,
    },
  );

  return request;
}
