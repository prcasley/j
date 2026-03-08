const CONGRATS = [
  "ARISE, Shadow Soldier. Another dungeon cleared.",
  "The System registers your power increase.",
  "Sung Jin Woo would be proud. Shadow Army grows stronger.",
  "You didn't come this far to only come this far.",
  "Another gate conquered. The monarchs tremble.",
  "The weakest hunter just got stronger. Again.",
  "Kill them with discipline. Bury them with gains.",
  "Your shadow army grows. The world isn't ready.",
  "Power acknowledged. Rank-up approaching.",
  "The double dungeon forged you. This workout refined you.",
];

function pickCongrats() {
  return CONGRATS[Math.floor(Math.random() * CONGRATS.length)];
}

function formatVolume(v) {
  return v.toLocaleString();
}

export function formatReply(workoutData, excelStats, summary) {
  const lines = [];

  // Header with congrats
  lines.push(`**⚔ ${pickCongrats()}**`);
  lines.push("");

  // Workout logged
  lines.push(`**📋 WORKOUT LOGGED: ${workoutData.workoutName || "Custom"}**`);
  lines.push(`📅 ${workoutData.date}`);
  lines.push("");

  // Exercise breakdown
  lines.push("**Exercises:**");
  for (const ex of workoutData.exercises) {
    const totalVol = ex.sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
    const setsStr = ex.sets.map((s) => `${s.reps}×${s.weight}`).join(", ");
    lines.push(`  • **${ex.name}** — ${setsStr} (${formatVolume(totalVol)} lbs)`);
  }
  lines.push("");

  // Session totals
  const sessionSets = workoutData.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0
  );
  const sessionVol = workoutData.exercises.reduce(
    (sum, ex) =>
      sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0),
    0
  );
  lines.push(
    `**💪 Session:** ${sessionSets} sets | ${formatVolume(sessionVol)} lbs total volume`
  );
  if (workoutData.duration_minutes) {
    lines.push(`**⏱ Duration:** ${workoutData.duration_minutes} min`);
  }
  lines.push("");

  // PRs
  if (summary.prs && summary.prs.length > 0) {
    lines.push("**🏆 PERSONAL RECORDS:**");
    for (const pr of summary.prs) {
      lines.push(
        `  🔥 **${pr.exercise}**: ${pr.weight} lbs (prev: ${pr.previous} lbs)`
      );
    }
    lines.push("");
  }

  // Period stats
  lines.push("**📊 STATS:**");
  lines.push(
    `  Today: ${summary.today.workouts} workout(s) | ${formatVolume(summary.today.totalVolume)} lbs`
  );
  lines.push(
    `  This Week: ${summary.week.workouts} workout(s) | ${formatVolume(summary.week.totalVolume)} lbs`
  );
  lines.push(
    `  This Month: ${summary.month.workouts} workout(s) | ${formatVolume(summary.month.totalVolume)} lbs`
  );
  lines.push(
    `  This Year: ${summary.year.workouts} workout(s) | ${formatVolume(summary.year.totalVolume)} lbs`
  );
  lines.push("");

  // Remaining this week
  lines.push("**🗓 REST OF THE WEEK:**");
  if (summary.remaining.length === 0) {
    lines.push("  ✅ All workouts complete! Shadow Army at full power.");
  } else {
    for (const r of summary.remaining) {
      lines.push(`  ⬜ ${r}`);
    }
  }
  lines.push("");

  // All-time
  lines.push(
    `**🏅 All-Time:** ${summary.totalAllTime.workouts} workouts | ${formatVolume(excelStats.totalVolume)} lbs lifted`
  );

  // Excel attached note
  lines.push("");
  lines.push("📎 *Updated workout_log.xlsx attached*");

  return lines.join("\n");
}
