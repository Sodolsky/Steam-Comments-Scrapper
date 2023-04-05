import puppeteer from "puppeteer";
import fs from "fs";
const getUserComments = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  //? Here you paste user steam profile
  const userLink = "https://steamcommunity.com/profiles/76561199003638675";
  const formattedLink = `${userLink}/allcomments`;
  await page.goto(`${formattedLink}`);
  const nextPageSelector = ".pagebtn";
  //#commentthread_Profile_76561198163405426_pagebtn_next
  const commentSelector = ".commentthread_comment_text";
  const pageSelectors = await page.$$(".commentthread_pagelink");
  let numberOfPages = 0;
  if (pageSelectors.length > 1) {
    numberOfPages = await pageSelectors[pageSelectors.length - 1].evaluate(
      (node) => node.textContent
    );
  }

  const arrayOfComments = [];
  await page.setViewport({ width: 1080, height: 1024 });
  for (let i = 0; i < numberOfPages; i++) {
    console.log(page.url());
    console.log(`Progress:${(i / numberOfPages).toFixed(2) * 100}%`);
    const pageSwitchButtons = await page.$$(nextPageSelector);
    const nextPageSelectorButton =
      pageSwitchButtons[pageSwitchButtons.length - 1];
    const selectors = await page.$$(commentSelector);
    //Extracting text from all elements
    const localArr = [];
    for (let i = 0; i < selectors.length; i++) {
      const element = selectors[i];
      const text = await element.evaluate((node) => node.textContent);
      const cleanedString = text.replace(/[\t\n]/g, "");
      localArr.push(cleanedString);
    }
    arrayOfComments.push(localArr);
    const classList = await page.evaluate(
      (button) => Array.from(button.classList),
      nextPageSelectorButton
    );
    //Check if switching pages button is disabled if is is break the loop
    const isDisabled = classList.some((x) => x === "disabled");
    if (isDisabled) {
      break;
    }
    //If the button can still be clicked switch the page and collect more comments
    await nextPageSelectorButton.click();
    await page.waitForNavigation();
    await page.waitForSelector(nextPageSelector);
  }
  //Write to file
  writeToFile(arrayOfComments);
  await browser.close();
};
const writeToFile = async (arrayOfComments) => {
  const writeStream = fs.createWriteStream("comments.txt");
  arrayOfComments.flat(2).forEach((comment) => {
    writeStream.write(comment + "\n");
  });
  writeStream.end();
};
getUserComments();
