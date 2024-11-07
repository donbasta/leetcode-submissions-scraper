import fs from 'fs';
import { init, lang_to_ext, loadCookiesFromFile } from './utils';

function loadProblems(fname: string) {
  const buffer = fs.readFileSync(fname);
  const jsonString = buffer.toString('utf-8');
  const problems: Problem[] = JSON.parse(jsonString);
  return problems;
}

async function scrapeSubmissions(
  from: number | null = null,
  fname: string = 'problems.json'
) {
  const { browser, page } = await init();

  // Load pre-taken cookie from logged-in browser to log in
  const cookiePath = './leetcode.com.cookies.json';
  await loadCookiesFromFile(page, cookiePath);

  const problems: Problem[] = loadProblems(fname);

  for (const problem of problems) {
    if (problem.is_premium) {
      continue;
    }
    if (!problem.is_solved || !problem.name) {
      continue;
    }
    const tmp = problem.name.split(' ')[0];
    const problem_number = tmp.slice(0, tmp.length - 1);

    console.log(`currently scraping problem ${problem_number}`);
    if (from !== null && Number(problem_number) < from) {
      continue;
    }

    let problemPage = await browser.newPage();
    if (problem.href === null) {
      await problemPage.close();
      continue;
    }
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
          // console.log('submission table wrapper found!');
          await submissionsDataLayoutElement.waitForSelector(
            '.h-full.overflow-auto'
          );
          const submissionsTableElement = await submissionsDataLayoutElement.$(
            '.h-full.overflow-auto'
          );
          if (submissionsTableElement) {
            // console.log('submission table found!');
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
                await submissionDetailDataLayoutElement.waitForSelector('code');
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
                    const fpath = `./submissions/${difficulty}/${problem_number}.${extension}`;
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
  await browser.close();
}

const args = process.argv.slice(2);
if (args.length >= 1) {
  if (isNaN(Number(args[0]))) {
    throw `${args[0]} is not a valid integer`;
  }
  const from = Number(args[0]);
  if (args.length >= 2) {
    const fname = args[1];
    scrapeSubmissions(from, fname);
  } else {
    scrapeSubmissions(from);
  }
} else {
  scrapeSubmissions();
}
