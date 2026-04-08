import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../data/dashboard.json");

// V-Taper Protocol schedule
const WEEKLY_SCHEDULE = {
  monday: "Back Width + Delts",
  tuesday: "Lower + Core",
  wednesday: "Anime Pump",
  thursday: "Chest/Shoulder Pop",
};

function loadData() {
  if (!existsSync(DATA_PATH)) {
    return { workouts: [] };
  }
  return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
}

function saveData(data) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function getDateRange(period) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  switch (period) {
    case "today":
      return { start: today, end: today };
    case "week": {
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      return { start: monday.toISOString().slice(0, 10), end: today };
    }
    case "month": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: monthStart.toISOString().slice(0, 10), end: today };
    }
    case "year": {
      return { start: `${now.getFullYear()}-01-01`, end: today };
    }
    default:
      return { start: today, end: today };
  }
}

function filterWorkouts(workouts, period) {
  const { start, end } = getDateRange(period);
  return workouts.filter((w) => w.date >= start && w.date <= end);
}

function calcStats(workouts) {
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;

  for (const w of workouts) {
    for (const ex of w.exercises) {
      for (const set of ex.sets) {
        totalSets++;
        totalReps += set.reps;
        totalVolume += set.reps * set.weight;
      }
    }
  }

  return {
    workouts: workouts.length,
    totalSets,
    totalReps,
    totalVolume,
  };
}

export async function updateDashboardData(workoutData) {
  const data = loadData();

  // Build workout entry
  const entry = {
    date: workoutData.date,
    workoutName: workoutData.workoutName || "Custom",
    template: workoutData.template || "custom",
    exercises: workoutData.exercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets,
    })),
    notes: workoutData.notes || "",
    duration_minutes: workoutData.duration_minutes || null,
    loggedAt: new Date().toISOString(),
  };

  data.workouts.push(entry);
  saveData(data);

  return entry;
}

export async function getDashboardSummary() {
  const data = loadData();
  const workouts = data.workouts || [];

  const today = calcStats(filterWorkouts(workouts, "today"));
  const week = calcStats(filterWorkouts(workouts, "week"));
  const month = calcStats(filterWorkouts(workouts, "month"));
  const year = calcStats(filterWorkouts(workouts, "year"));

  // Figure out remaining workouts this week
  const weekWorkouts = filterWorkouts(workouts, "week");
  const completedDays = new Set(weekWorkouts.map((w) => w.template));
  const remaining = [];

  for (const [day, name] of Object.entries(WEEKLY_SCHEDULE)) {
    if (!completedDays.has(day)) {
      const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
      remaining.push(`${dayCapitalized}: ${name}`);
    }
  }

  // Personal records this session
  const latestWorkout = workouts[workouts.length - 1];
  let prs = [];
  if (latestWorkout) {
    for (const ex of latestWorkout.exercises) {
      const maxWeight = Math.max(...ex.sets.map((s) => s.weight));
      // Check if this is a PR across all workouts
      const allWeightsForExercise = workouts
        .flatMap((w) => w.exercises)
        .filter((e) => e.name === ex.name)
        .flatMap((e) => e.sets.map((s) => s.weight));

      const previousMax = Math.max(
        ...allWeightsForExercise.filter((w) => w !== maxWeight),
        0
      );

      if (maxWeight > previousMax && workouts.length > 1) {
        prs.push({ exercise: ex.name, weight: maxWeight, previous: previousMax });
      }
    }
  }

  return {
    today,
    week,
    month,
    year,
    remaining,
    prs,
    totalAllTime: {
      workouts: workouts.length,
    },
  };
}
