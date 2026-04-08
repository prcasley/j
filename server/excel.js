import ExcelJS from "exceljs";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXCEL_PATH = resolve(__dirname, "../data/workout_log.xlsx");

// Solo Leveling purple/dark theme colors
const COLORS = {
  headerBg: "1a0a2e",
  headerFont: "c084fc",
  dateBg: "0f0a1a",
  dateFont: "a78bfa",
  exerciseBg: "050810",
  exerciseFont: "e2e8f0",
  setBg: "0a0e1a",
  setFont: "94a3b8",
  borderColor: "7c3aed",
  totalBg: "1e1040",
  totalFont: "f59e0b",
};

function styleCell(cell, bgColor, fontColor, bold = false) {
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: `FF${bgColor}` },
  };
  cell.font = {
    color: { argb: `FF${fontColor}` },
    bold,
    name: "Consolas",
    size: 11,
  };
  cell.border = {
    top: { style: "thin", color: { argb: `FF${COLORS.borderColor}` } },
    bottom: { style: "thin", color: { argb: `FF${COLORS.borderColor}` } },
    left: { style: "thin", color: { argb: `FF${COLORS.borderColor}` } },
    right: { style: "thin", color: { argb: `FF${COLORS.borderColor}` } },
  };
}

export async function updateExcel(workoutData) {
  let workbook;

  if (existsSync(EXCEL_PATH)) {
    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(EXCEL_PATH);
  } else {
    workbook = new ExcelJS.Workbook();
    workbook.creator = "Shadow Monarch OS";
  }

  // Get or create the main log sheet
  let logSheet = workbook.getWorksheet("Workout Log");
  if (!logSheet) {
    logSheet = workbook.addWorksheet("Workout Log", {
      properties: { tabColor: { argb: "FF7c3aed" } },
    });
    // Add header row
    const headerRow = logSheet.addRow([
      "Date",
      "Workout",
      "Exercise",
      "Set",
      "Reps",
      "Weight (lbs)",
      "Volume (lbs)",
    ]);
    headerRow.eachCell((cell) =>
      styleCell(cell, COLORS.headerBg, COLORS.headerFont, true)
    );
    logSheet.columns = [
      { width: 14 },
      { width: 22 },
      { width: 24 },
      { width: 6 },
      { width: 6 },
      { width: 14 },
      { width: 14 },
    ];
  }

  // Get or create stats sheet
  let statsSheet = workbook.getWorksheet("Daily Stats");
  if (!statsSheet) {
    statsSheet = workbook.addWorksheet("Daily Stats", {
      properties: { tabColor: { argb: "FFf59e0b" } },
    });
    const headerRow = statsSheet.addRow([
      "Date",
      "Workout",
      "Total Exercises",
      "Total Sets",
      "Total Reps",
      "Total Volume (lbs)",
      "Duration (min)",
    ]);
    headerRow.eachCell((cell) =>
      styleCell(cell, COLORS.headerBg, COLORS.headerFont, true)
    );
    statsSheet.columns = [
      { width: 14 },
      { width: 22 },
      { width: 16 },
      { width: 12 },
      { width: 12 },
      { width: 18 },
      { width: 14 },
    ];
  }

  // Add exercise rows to log sheet
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;
  const date = workoutData.date;
  const woName = workoutData.workoutName || "Custom Workout";

  for (const exercise of workoutData.exercises) {
    for (let i = 0; i < exercise.sets.length; i++) {
      const set = exercise.sets[i];
      const volume = set.reps * set.weight;
      totalSets++;
      totalReps += set.reps;
      totalVolume += volume;

      const row = logSheet.addRow([
        date,
        woName,
        exercise.name,
        i + 1,
        set.reps,
        set.weight,
        volume,
      ]);

      row.getCell(1).numFmt = "yyyy-mm-dd";
      styleCell(row.getCell(1), COLORS.dateBg, COLORS.dateFont);
      styleCell(row.getCell(2), COLORS.dateBg, COLORS.dateFont);
      styleCell(row.getCell(3), COLORS.exerciseBg, COLORS.exerciseFont);
      styleCell(row.getCell(4), COLORS.setBg, COLORS.setFont);
      styleCell(row.getCell(5), COLORS.setBg, COLORS.setFont);
      styleCell(row.getCell(6), COLORS.setBg, COLORS.setFont);
      styleCell(row.getCell(7), COLORS.totalBg, COLORS.totalFont);
    }
  }

  // Add totals row
  const totRow = logSheet.addRow([
    date,
    woName,
    "═══ TOTAL ═══",
    totalSets,
    totalReps,
    "",
    totalVolume,
  ]);
  totRow.eachCell((cell) =>
    styleCell(cell, COLORS.totalBg, COLORS.totalFont, true)
  );

  // Add to daily stats sheet
  const statsRow = statsSheet.addRow([
    date,
    woName,
    workoutData.exercises.length,
    totalSets,
    totalReps,
    totalVolume,
    workoutData.duration_minutes || "",
  ]);
  statsRow.getCell(1).numFmt = "yyyy-mm-dd";
  statsRow.eachCell((cell) =>
    styleCell(cell, COLORS.exerciseBg, COLORS.exerciseFont)
  );

  await workbook.xlsx.writeFile(EXCEL_PATH);
  return EXCEL_PATH;
}

export async function getStats() {
  if (!existsSync(EXCEL_PATH)) {
    return { totalWorkouts: 0, totalVolume: 0, totalSets: 0 };
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(EXCEL_PATH);

  const statsSheet = workbook.getWorksheet("Daily Stats");
  if (!statsSheet) {
    return { totalWorkouts: 0, totalVolume: 0, totalSets: 0 };
  }

  let totalWorkouts = 0;
  let totalVolume = 0;
  let totalSets = 0;

  statsSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    totalWorkouts++;
    totalSets += Number(row.getCell(4).value) || 0;
    totalVolume += Number(row.getCell(6).value) || 0;
  });

  return { totalWorkouts, totalVolume, totalSets };
}
