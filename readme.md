# Leetcode Submission Scraper

A scraper written in Typescript for scraping all your leetcode submissions, made with Puppeteer.

## Using the Program

1. Login to leetcode from your browser, and obtain the cookie for Puppeteer (you can use `Export cookies JSON file for Puppeteer` chrome extension [here](https://chromewebstore.google.com/detail/export-cookie-json-file-f/nmckokihipjgplolmcmjakknndddifde))

2. Copy the json file containing the cookie to the root of this repo, and rename it into `leetcode.com.cookies.json`

3. Scrape the problem informations from the leetcode problemset page. The information is stored as `Problem` type, whose definition is in `types.ts`. To run, simply execute the below command (the argument variables is not necessary (if not supplied, the default value `problems.json` will be used))

```
npm run getProblems <problems_info.json>
```

4. Scrape each submission of the problems list which is obtained in the previous step. You can choose to select from any index by supplying an optional argument variables in the first position,
   and also choose the problems information json file name in the second argument variables. Before executing the command, create `submissions` directory in the repo root with three sub-directories
   `Easy`, `Medium`, and `Hard`. The submissions will be stored with format `<problem_number>.<language_extension>`

```
npm run getSubmissions <index_to_start> <problems_info.json>
```
