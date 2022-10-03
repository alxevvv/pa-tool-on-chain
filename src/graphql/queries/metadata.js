export async function getMetadataList() {
  const response = await fetch(process.env.VUE_APP_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query {
          transactions(where: { metadata: { key: { _eq: "${process.env.VUE_APP_METADATA_KEY}" } } }) {
            metadata {
              key
              value
            }
          }
        }
      `,
    }),
  });
  const { data } = await response.json();
  return data.transactions.map(({ metadata }) => {
    return metadata[0].value;
  });
}
