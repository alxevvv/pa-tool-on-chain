import { useNotificationsStore } from "@/stores/notificationsStore";

export default function useClipboard() {
  const notificationsStore = useNotificationsStore();

  const defaultCopyOptions = {
    title: "",
    notify: true,
  };

  async function copy(content, options = {}) {
    const opts = {
      ...defaultCopyOptions,
      ...options,
    };

    try {
      await navigator.clipboard.writeText(content);
      opts.notify &&
        notificationsStore.add({
          type: "is-success",
          text: opts.title ? `${opts.title} copied to clipboard` : "Copied to clipboard",
          duration: 2000,
        });
    } catch (err) {
      opts.notify &&
        notificationsStore.add({
          type: "is-danger",
          text: `Error copying to clipboard: ${err.toString()}`,
          duration: 5000,
        });
    }
  }

  return {
    copy,
  };
}
