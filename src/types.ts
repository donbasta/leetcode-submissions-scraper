type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface Problem {
  name: string | null;
  difficulty: Difficulty | null;
  is_solved: boolean | null;
  source_code: string | null;
  href: string | null;
  is_premium: boolean | null;
}
