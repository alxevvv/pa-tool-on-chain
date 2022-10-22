const defaultOptions = {
  startLength: 4,
  endLength: 4,
  delimiter: "...",
};

export default function compactString(string, options = {}) {
  const opts = {
    ...options,
    ...defaultOptions,
  };
  return string.slice(0, opts.startLength) + opts.delimiter + string.slice(string.length - opts.endLength);
}
