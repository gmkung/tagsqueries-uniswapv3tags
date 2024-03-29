// Use dynamic import for node-fetch
import fetch from "node-fetch";
const GET_POOLS_QUERY = `
  query GetPools($lastTimestamp: Int) {
    pools(
      first: 1000,
      orderBy: createdAtTimestamp,
      orderDirection: asc,
      where: { createdAtTimestamp_gt: $lastTimestamp }
    ) {
      id
      createdAtTimestamp
      token0 {
        id
        name
        symbol
      }
      token1 {
        id
        name
        symbol
      }
    }
  }
`;
async function returnTags(chainId, apiKey) {
    let lastTimestamp = 0;
    let allTags = [];
    let isMore = true;
    // Check if the chain ID is Ethereum Mainnet
    if (chainId !== "1") {
        throw new Error(`Unsupported Chain ID: ${chainId}. This function only supports Ethereum Mainnet.`);
    }
    // Simple API key validation (e.g., check if it's a non-empty string of reasonable length)
    if (!apiKey || apiKey.length < 20) {
        // Adjust length check as needed
        throw new Error("Invalid API key format.");
    }
    while (isMore) {
        const response = await fetch("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                query: GET_POOLS_QUERY,
                variables: { lastTimestamp: lastTimestamp },
            }),
        });
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const result = (await response.json());
        const pools = result.data.pools;
        allTags.push(...transformPoolsToTags(chainId, pools));
        if (pools.length < 1000) {
            isMore = false;
        }
        else {
            lastTimestamp = parseInt(pools[pools.length - 1].createdAtTimestamp.toString());
        }
    }
    return allTags;
}
function transformPoolsToTags(chainId, pools) {
    return pools.map((pool) => ({
        "Contract Address": `eip155:${chainId}:${pool.id}`,
        "Public Name Tag": `${pool.token0.symbol}/${pool.token1.symbol} pool`,
        "Project Name": "Uniswap v3",
        "UI/Website Link": "https://uniswap.org",
        "Public Note": `The liquidity pool contract on Uniswap v3 for the ${pool.token0.name}(${pool.token0.symbol}) / ${pool.token1.name}(${pool.token1.symbol}) pair.`,
    }));
}
export { returnTags };
