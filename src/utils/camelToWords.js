export default function camelToWords(camelString) {
  return camelString.replace(/([A-Z])/g, " $1").toLowerCase();
}
