import { loadProblems, problem_title_to_number } from './utils';
import fs from 'fs';
import path from 'path';

const difficulties: string[] = ['Easy', 'Medium', 'Hard'];

export async function syncSubmissions(
  submission_folder: string,
  fname: string = 'problems.json'
) {
  try {
    const problems: Problem[] = loadProblems(fname);
    let id_to_problem: { [key: string]: Problem } = {};
    for (const problem of problems) {
      if (problem.name === null) continue;
      id_to_problem[problem_title_to_number(problem.name)] = problem;
    }

    const traverseSubmissions = (submission_folder: string) => {
      try {
        const submissionDirContents = fs.readdirSync(submission_folder);
        for (const item of submissionDirContents) {
          const fullPath = path.join(submission_folder, item);
          const stats = fs.statSync(fullPath);
          if (stats.isDirectory()) {
            if (difficulties.includes(item)) traverseSubmissions(fullPath);
          } else {
            const problem_number = fullPath.split('/').at(-1)?.split('.').at(0);
            if (problem_number === undefined) continue;
            if (!(problem_number in id_to_problem)) continue;
            id_to_problem[problem_number].is_submission_scraped = true;
          }
        }
      } catch (err) {
        console.error(`[traverseSubmissions(${submission_folder})]: ${err}`);
      }
    };

    traverseSubmissions(submission_folder);
    const updated_problems: Problem[] = [];
    for (const [_, val] of Object.entries(id_to_problem)) {
      updated_problems.push(val);
    }
    fs.writeFileSync(fname, JSON.stringify(updated_problems, null, 2));
  } catch (err) {
    console.error(`[syncSubmissions]: ${err}`);
  }
}
