import fs from 'fs';
import {
  init,
  lang_to_ext,
  loadCookiesFromFile,
  loadProblems,
  problem_title_to_number,
} from './utils';
import path from 'path';
import { Browser } from 'puppeteer';

export async function scrapeSubmissions(
  submission_folder: string,
  fname: string = 'problems.json',
  from: number | null = null
) {
  let b: Browser | null = null;
  try {
    const { browser, page } = await init();
    b = browser;

    // Load pre-taken cookie from logged-in browser to log in
    const cookiePath = './leetcode.com.cookies.json';
    await loadCookiesFromFile(page, cookiePath);

    const problems: Problem[] = loadProblems(fname);

    for (const problem of problems) {
      // skip scraping if problem is premium
      // or if the problem is not solved
      // or it has been scraped previously
      if (problem.is_premium) {
        continue;
      }
      if (!problem.is_solved || !problem.name) {
        continue;
      }
      if (problem.href === null) {
        continue;
      }
      if (problem.is_submission_scraped) {
        continue;
      }

      // get the problem number for the submission code filename
      const problem_number = problem_title_to_number(problem.name);

      console.log(`currently scraping problem ${problem_number}`);

      if (from !== null && Number(problem_number) < from) {
        continue;
      }

      let problemPage = await b.newPage();
      await problemPage.goto(problem.href);
      await problemPage.waitForSelector('#description_tabbar_outer');
      const tabBarElement = await problemPage.$('#description_tabbar_outer');
      if (tabBarElement) {
        const submissionTabBarElement = await tabBarElement.$(
          '*[data-layout-path="/ts0/tb3"]'
        );
        if (submissionTabBarElement) {
          await submissionTabBarElement.click();
          await problemPage.waitForSelector('*[data-layout-path="/ts0/t3"]');
          const submissionsDataLayoutElement = await problemPage.$(
            '*[data-layout-path="/ts0/t3"]'
          );
          if (submissionsDataLayoutElement) {
            await submissionsDataLayoutElement.waitForSelector(
              '.h-full.overflow-auto'
            );
            const submissionsTableElement =
              await submissionsDataLayoutElement.$('.h-full.overflow-auto');
            if (submissionsTableElement) {
              const submissionElements =
                await submissionsTableElement.$$(':scope > *');
              let acceptedSubmissionExist = false;
              for (const submissionElement of submissionElements) {
                const statusTextElement = await submissionElement.$('span');
                if (statusTextElement) {
                  const submissionStatus = await statusTextElement.evaluate(
                    (node) => node.textContent
                  );
                  if (submissionStatus === 'Accepted') {
                    acceptedSubmissionExist = true;
                    await submissionElement.click();
                    break;
                  }
                }
              }
              if (acceptedSubmissionExist) {
                await problemPage.waitForSelector(
                  '*[data-layout-path="/c1/ts0/t1"]'
                );
                const submissionDetailDataLayoutElement = await problemPage.$(
                  '*[data-layout-path="/c1/ts0/t1"]'
                );
                if (submissionDetailDataLayoutElement) {
                  const languageTypeElementXPath =
                    '::-p-xpath(/html/body/div[1]/div[2]/div/div/div[4]/div/div/div[11]/div/div/div/div[2]/div/div[3]/div[1])';
                  await submissionDetailDataLayoutElement.waitForSelector(
                    languageTypeElementXPath
                  );
                  await submissionDetailDataLayoutElement.waitForSelector(
                    'code'
                  );
                  const languageTypeElement =
                    await submissionDetailDataLayoutElement.$(
                      languageTypeElementXPath
                    );
                  let language: string | null = 'C++';
                  if (languageTypeElement) {
                    language = await languageTypeElement.evaluate(
                      (node) => node.textContent
                    );
                    if (language) {
                      language = language.replace('Code', '');
                    }
                  }
                  const codeElement =
                    await submissionDetailDataLayoutElement.$('code');
                  if (codeElement) {
                    const submission = await codeElement.evaluate(
                      (node) => node.textContent
                    );
                    if (submission && language) {
                      const difficulty = problem.difficulty;
                      const extension = lang_to_ext[language];
                      const fpath = `${submission_folder}/${difficulty}/${problem_number}.${extension}`;
                      const dirPath = path.dirname(fpath);
                      if (!fs.existsSync(dirPath)) {
                        fs.mkdirSync(dirPath, { recursive: true });
                      }
                      fs.writeFileSync(fpath, submission);
                    }
                  }
                }
              }
            } else {
              console.log('submission table not found!');
            }
          }
        }
      }
      await problemPage.close();
    }
    await b.close();
  } catch (err) {
    console.error(
      `[scrapeSubmissions(${submission_folder}$, ${fname}$, ${from}$)]: ${err}`
    );
  } finally {
    if (b) {
      await b.close();
    }
  }
}
