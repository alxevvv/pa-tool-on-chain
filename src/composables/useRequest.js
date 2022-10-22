import { ref, watch } from "vue";
import { useRequestsStore } from "@/stores/requestsStore";
import { useNotificationsStore } from "@/stores/notificationsStore";

const defaultOptions = {
  requestArguments: [],
  onSuccess: () => {},
  onError: () => {},
};

export default function useRequest(rq, options = {}) {
  const opts = {
    ...defaultOptions,
    ...options,
  };

  const requestsStore = useRequestsStore();
  const notificationsStore = useNotificationsStore();

  const request = ref(null);
  const url = ref(rq(...opts.requestArguments));

  watch(
    () => requestsStore.requests[url.value]?.isLoading,
    () => {
      const storedRequest = requestsStore.requests[url.value];
      if (storedRequest) {
        request.value = storedRequest;
        if (request.value.isFailed) {
          opts.onError(request.value.error);
          notificationsStore.add({
            type: "is-danger",
            text: `Request error: ${request.value.error?.data?.message}` || "Unknown request error",
          });
        }
        if (request.value.isSuccess) {
          opts.onSuccess(request.value.data);
        }
      }
    },
    {
      immediate: true,
    },
  );

  return request;
}
