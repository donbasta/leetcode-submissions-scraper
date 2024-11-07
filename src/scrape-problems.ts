import { init, loadCookiesFromFile } from './utils';
import fs from 'fs';

async function scrapeProblems(fname: string = 'problems.json') {
  const { browser, page } = await init();

  const cookiePath = './leetcode.com.cookies.json';
  await loadCookiesFromFile(page, cookiePath);

  //TODO: fetch the page number by checking the pagination bar and find the last page number instead of hardcode
  const NUM_PAGE = 67;

  let problems: Problem[] = [];

  for (let current_page = 1; current_page <= NUM_PAGE; current_page++) {
    await page.goto(`https://leetcode.com/problemset/?page=${current_page}`);
    await page.waitForSelector('[role="rowgroup"]');

    const rowGroups = await page.$$('*[role="rowgroup"]');
    if (rowGroups.length > 0) {
      const rowGroup = rowGroups[rowGroups.length - 1];
      const rowElements = await rowGroup.$$(':scope > *');

      console.log(
        `finding ${rowElements.length} problems in page ${current_page}`
      );

      for (const rowElement of rowElements) {
        const columnElements = await rowElement.$$(':scope > *');

        let is_solved = null;
        let href = null;
        let name = null;
        let difficulty = null;
        let is_premium = null;

        const secondColumnElement = columnElements[1];
        const linkElement = await secondColumnElement.$('a');
        if (linkElement) {
          href = await linkElement.evaluate((node) => node.href);
          name = await linkElement.evaluate((node) => node.text);
        }
        const premiumLogoElement = await secondColumnElement.$('svg');
        if (premiumLogoElement) {
          is_premium = true;
        } else {
          is_premium = false;
        }

        const firstColumnElement = columnElements[0];
        const greenCheckMarkElement = await firstColumnElement.$('svg');

        if (greenCheckMarkElement && is_premium !== null && !is_premium) {
          is_solved = true;
        } else {
          is_solved = false;
        }

        const fifthColumnElement = columnElements[4];
        const difficultyElement = await fifthColumnElement.$('span');
        if (difficultyElement) {
          difficulty = await difficultyElement.evaluate(
            (node) => node.textContent
          );
          if (difficulty !== null) {
            difficulty = difficulty as Difficulty;
          }
        }

        problems.push({
          name,
          difficulty,
          is_solved,
          source_code: null,
          href,
          is_premium,
        });
      }

      fs.writeFileSync(fname, JSON.stringify(problems, null, 2));
    }
  }
  console.log('successfully scrape all problems');
  await browser.close();
}

const args = process.argv.slice(2);
if (args.length >= 1) {
  const fname = args[0];
  scrapeProblems(fname);
} else {
  scrapeProblems();
}
