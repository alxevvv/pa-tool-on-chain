import saveToFile from "@/utils/saveToFile";

export default function useDownload() {
  function toFile(content, fileName, contentType) {
    saveToFile(content, fileName, contentType);
  }

  function toJson(content, fileName = "download.json") {
    const ct = typeof content !== "string" ? JSON.stringify(content, null, 2) : content;
    const fn = !fileName.endsWith(".json") ? `${fileName}.json` : fileName;
    toFile(ct, fn, "application/json");
  }

  return {
    toFile,
    toJson,
  };
}
