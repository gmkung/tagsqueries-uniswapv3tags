import { returnTags } from "uniswapv3tags"; // Make sure this path matches the actual exported path
import { writeFile } from "fs/promises";

// Function to convert an array of objects to a CSV string
function jsonToCSV(items) {
  const replacer = (key, value) => (value === null ? "" : value);
  const header = Object.keys(items[0]);
  const csv = [
    header.join(","), // header row first
    ...items.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    ),
  ].join("\r\n");

  return csv;
}

async function test() {
  try {
    const tags = await returnTags("1", "A20CharacterApiKeyThatWorks");
    // Convert JSON to CSV
    const csv = jsonToCSV(tags);
    // Output CSV to a file
    await writeFile("tags.csv", csv);
    console.log("Tags have been written to tags.csv");
  } catch (error) {
    console.error(error);
  }
}

test();
