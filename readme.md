# Leetcode Submission Scraper

A scraper written in Typescript for scraping all your leetcode submissions, made with Puppeteer.

## Using the Program

1. Login to leetcode from your browser, and obtain the cookie for Puppeteer (you can use `Export cookies JSON file for Puppeteer` chrome extension [here](https://chromewebstore.google.com/detail/export-cookie-json-file-f/nmckokihipjgplolmcmjakknndddifde))

2. Copy the json file containing the cookie to the root of this repo, and rename it into `leetcode.com.cookies.json`

3. The flow of the scrapper is as follows:
   - Scrape all problems info from the Problemset page.
   - Determine the problems that need to be scrapped based on submission status (obtained from the previous step), and the local submissions directory.
   - Scrape the accepted submissions which does not yet exist in the local submissions directory.

Run the following script to perform all the steps above:

```
npm run start <local submissions root directory path> <json file path to save the problem info>
```
