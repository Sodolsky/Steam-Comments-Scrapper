import fs from "fs";
import readline from "readline";

async function processLineByLine() {
  const fileStream = fs.createReadStream("comments.txt");

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  const words = {};

  for await (const line of rl) {
    const splittedLine = line.split(" ");
    splittedLine
      .map((x) => x.toLowerCase())
      .forEach((item) => {
        if (words[item]) {
          words[item] = words[item] += 1;
        } else {
          words[item] = 1;
        }
      });
  }
  const sortedArray = Object.entries(words).sort((a, b) => b[1] - a[1]);

  const top100 = sortedArray.slice(0, 100);

  for (const [key, value] of top100) {
    if (key.length > 3) {
      console.log(`${key}: ${value}`);
    }
  }
}

processLineByLine();
