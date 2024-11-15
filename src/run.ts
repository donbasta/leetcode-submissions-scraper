import { scrapeProblems } from './scrape-problems';
import { scrapeSubmissions } from './scrape-submissions';
import { syncSubmissions } from './sync-submissions';

const args = process.argv.slice(2);
if (args.length != 2) {
  throw 'please provide 2 arguments: path to problems config file, and path to root directory for submissions';
}

const submissionDir = args[0];
const problemsConfigDataPath = args[1];
console.log(submissionDir, problemsConfigDataPath);

async function main() {
  try {
    await scrapeProblems(problemsConfigDataPath);
    await syncSubmissions(submissionDir, problemsConfigDataPath);
    await scrapeSubmissions(submissionDir, problemsConfigDataPath);
  } catch (err) {
    console.error(err);
  }
}

main();
