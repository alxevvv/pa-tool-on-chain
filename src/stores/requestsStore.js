import { reactive, readonly } from "vue";
import { defineStore } from "pinia";
import testFundsSet from "@/assets/testData/testFundsSet.json";

export const useRequestsStore = defineStore(
  "requests",
  () => {
    const requests = reactive({});

    function onBeforeRequest(url) {
      requests[url] = {
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

      // TODO: setup testing instead making this condition
      if (
        url ===
        "http://localhost:5434/tx_metadata?key=eq.810949&json-%3E%3Eaction=eq.fundGenesis&select=*%2Ctx%28hash%2Cblock%28time%29%29"
      ) {
        data = testFundsSet;
      } else {
        try {
          response = await fetch(url);
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
      }

      onAfterResponse(url, error, data);
    }

    return {
      requests: readonly(requests),
      sendRequest,
    };
  },
  { persist: false },
);
