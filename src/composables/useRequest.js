import { computed, ref, watch } from "vue";
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

  const url = ref(rq(...opts.requestArguments));
  const request = computed(() => requestsStore.requests[url.value]);

  function remove() {
    requestsStore.removeRequest(request.value);
  }

  const unwatch = watch(
    () => request.value?.isLoading,
    () => {
      if (request.value) {
        if (request.value.isFailed) {
          opts.onError(request.value.error);
          notificationsStore.add({
            type: "is-danger",
            text: `Request error: ${request.value.error?.data?.message}` || "Unknown request error",
          });
          unwatch();
        }
        if (request.value.isSuccess) {
          opts.onSuccess(request.value.data);
          unwatch();
        }
      }
    },
  );

  return {
    url,
    request,

    remove,
  };
}
