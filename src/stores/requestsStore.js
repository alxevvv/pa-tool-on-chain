import { reactive, readonly } from "vue";
import { defineStore } from "pinia";

export const useRequestsStore = defineStore(
  "requests",
  () => {
    const requests = reactive({});

    function onBeforeRequest(url) {
      requests[url] = {
        url,
        requestedAt: Date.now(),
        isLoading: true,
      };
    }

    function onAfterResponse(url, error, data) {
      Object.assign(requests[url], {
        respondedAt: Date.now(),
        isLoading: false,
        isSuccess: !error,
        isFailed: !!error,
        error,
        data,
      });
    }

    function createError(response, data) {
      return {
        statusCode: null,
        statusText: "",
        data: {
          code: "",
          details: null,
          hint: "",
          message: "",
          ...(data || {}),
        },
        ...(response || {}),
      };
    }

    async function sendRequest(url, processResponse = async (response) => await response.json()) {
      let response;
      let error = null;
      let data = null;

      onBeforeRequest(url);

      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        response = await fetch(url);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (err) {
        error = createError(null, { message: `Data fetching error: ${err.toString()}` });
      }

      if (!error) {
        if (!response.ok) {
          const errorResponse = {
            statusCode: response.status,
            statusText: response.statusText,
          };
          try {
            const errorDetails = await processResponse(response);
            error = createError(errorResponse, errorDetails);
          } catch {
            error = createError(errorResponse, { message: "Could not get error details" });
          }
        } else {
          try {
            data = await processResponse(response);
          } catch (err) {
            error = createError(null, { message: `Response processing error: ${err.toString()}` });
          }
        }
      }

      onAfterResponse(url, error, data);
    }

    function removeRequest(request) {
      if (requests[request.url]) {
        delete requests[request.url];
      }
    }

    return {
      requests: readonly(requests),

      sendRequest,
      removeRequest,
    };
  },
  { persist: false },
);
