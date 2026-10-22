const DAY_MS = 24 * 60 * 60 * 1000;

export function computeMetrics(user, config, now = new Date()) {
  const calendar = user.contributionsCollection.contributionCalendar;
  const days = calendar.weeks.flatMap((week) => week.contributionDays);
  const repos = user.repositories.nodes;

  return {
    age: ageOn(new Date(config.birthDate), now),
    daysCoding: Math.floor((now - new Date(config.codingSince)) / DAY_MS),
    commitsYear: user.contributionsCollection.totalCommitContributions,
    prsYear: user.contributionsCollection.totalPullRequestContributions,
    contributionsYear: calendar.totalContributions,
    stars: repos.reduce((sum, repo) => sum + repo.stargazerCount, 0),
    repos: user.repositories.totalCount,
    followers: user.followers.totalCount,
    streak: streaks(days),
    languages: topLanguages(repos),
    days,
    updatedAt: now.toISOString().slice(0, 10),
  };
}

function ageOn(birth, now) {
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < birth.getUTCDate())) {
    age--;
  }
  return age;
}

// Los días van en orden cronológico. Si hoy aún no tiene contribuciones,
// la racha actual no se considera rota: se cuenta desde ayer.
function streaks(days) {
  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day.contributionCount > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) {
      current++;
    } else if (i !== days.length - 1) {
      break;
    }
  }

  return { current, longest };
}

// Suma el tamaño en bytes por lenguaje entre todos los repos. Lo que queda
// fuera del top se agrupa en "Otros".
function topLanguages(repos, limit = 5) {
  const totals = new Map();
  for (const repo of repos) {
    for (const { size, node } of repo.languages.edges) {
      const entry = totals.get(node.name) ?? { name: node.name, color: node.color, size: 0 };
      entry.size += size;
      totals.set(node.name, entry);
    }
  }

  const sorted = [...totals.values()].sort((a, b) => b.size - a.size);
  const total = sorted.reduce((sum, lang) => sum + lang.size, 0);
  const top = sorted.slice(0, limit);
  const othersSize = sorted.slice(limit).reduce((sum, lang) => sum + lang.size, 0);
  if (othersSize > 0) {
    top.push({ name: 'Otros', color: null, size: othersSize });
  }

  return top.map((lang) => ({ ...lang, pct: total ? (lang.size / total) * 100 : 0 }));
}
