import puppeteer from "puppeteer";
import fs from "fs";
(async () => {
  const browser = await puppeteer.launch();
  const writeStream = fs.createWriteStream("comments.txt");
  const page = await browser.newPage();
  const defaultLink =
    "https://steamcommunity.com/profiles/76561199003638675/allcomments";
  await page.goto(`${defaultLink}?ctp=1`);
  const nextPageSelector =
    "#commentthread_Profile_76561199003638675_pagebtn_next";
  const commentSelector = ".commentthread_comment_text";
  const arrayOfComments = [];
  await page.setViewport({ width: 1080, height: 1024 });
  for (let i = 0; i < 188; i++) {
    const nextPageSelectorButton = await page.$(nextPageSelector);
    const selectors = await page.$$(commentSelector);
    console.log(i);
    //Extracting text from all elements
    const localArr = [];
    for (let i = 0; i < selectors.length; i++) {
      const element = selectors[i];
      const text = await element.evaluate((node) => node.textContent);
      const cleanedString = text.replace(/[\t\n]/g, "");
      localArr.push(cleanedString);
    }
    arrayOfComments.push(localArr);
    await nextPageSelectorButton.click();
    await page.waitForNavigation();
    await page.waitForSelector(nextPageSelector);
  }
  arrayOfComments.flat(2).forEach((comment) => {
    writeStream.write(comment + "\n");
  });
  writeStream.end();
  await browser.close();
})();
