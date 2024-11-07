import puppeteer, { ElementHandle, Page } from 'puppeteer';
import fs from 'fs';

export async function init() {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );

  return { browser, page };
}

export async function loadCookiesFromFile(page: Page, filePath: string) {
  const cookieString = fs.readFileSync(filePath).toString();
  const cookies = JSON.parse(cookieString);
  await page.setCookie(...cookies);
}

export const lang_to_ext: { [key: string]: string } = {
  'C++': 'cpp',
  Python3: 'py',
  Python: 'py',
  JavaScript: 'js',
  Rust: 'rs',
  Pandas: 'py',
  Java: 'java',
  MySQL: 'sql',
};

export async function getElementAttributes(elementHandle: ElementHandle) {
  const elementInfo = await elementHandle.evaluate((element) => {
    // Get the tag name
    const tagName = element.tagName.toLowerCase(); // e.g., "div", "input", etc.

    // Get the attributes
    const attributes: { [key: string]: string } = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }

    // Return an object containing the tag name and attributes
    return {
      tagName,
      attributes,
    };
  });
  return elementInfo;
}
