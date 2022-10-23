export default function saveToFile(content, fileName = "download.txt", contentType = "text/plain") {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}
