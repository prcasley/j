import "dotenv/config";
import express from "express";
import { mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { Client, GatewayIntentBits, AttachmentBuilder } from "discord.js";
import { processWorkoutImage } from "./vision.js";
import { updateExcel, getStats } from "./excel.js";
import { updateDashboardData, getDashboardSummary } from "./dashboard.js";
import { formatReply } from "./reply.js";

// Ensure data directory exists (Railway has ephemeral filesystem)
const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(resolve(__dirname, "../data"), { recursive: true });

const app = express();
const PORT = process.env.PORT || 3777;

// ── Discord Bot ──────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`⚔ Shadow Monarch Bot online as ${client.user.tag}`);
  console.log(`  Listening for workout photos...`);
});

client.on("messageCreate", async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Check for image attachments
  const images = message.attachments.filter((a) =>
    a.contentType?.startsWith("image/")
  );

  if (images.size === 0) {
    // Handle text commands
    if (message.content.toLowerCase() === "!stats") {
      await handleStatsCommand(message);
      return;
    }
    if (message.content.toLowerCase() === "!help") {
      await message.reply(
        "**⚔ Shadow Monarch Workout Bot**\n" +
          "Send a photo of your workout to log it.\n" +
          "`!stats` — View your current stats\n" +
          "`!help` — Show this message"
      );
      return;
    }
    return;
  }

  // Process each workout image
  for (const [, attachment] of images) {
    await message.channel.sendTyping();

    try {
      console.log(`📸 Processing workout image from ${message.author.username}...`);

      // 1. Extract workout data from image using Claude Vision
      const workoutData = await processWorkoutImage(attachment.url);

      if (!workoutData || !workoutData.exercises || workoutData.exercises.length === 0) {
        await message.reply(
          "⚠ Couldn't extract workout data from that image. " +
            "Make sure it clearly shows exercises, sets, reps, and weight."
        );
        continue;
      }

      console.log(`  ✅ Extracted ${workoutData.exercises.length} exercises`);

      // 2. Update Excel spreadsheet
      const excelPath = await updateExcel(workoutData);
      console.log(`  📊 Excel updated: ${excelPath}`);

      // 3. Update dashboard data store
      const dashData = await updateDashboardData(workoutData);
      console.log(`  🎮 Dashboard data updated`);

      // 4. Get stats summary
      const stats = await getStats();
      const summary = await getDashboardSummary();

      // 5. Build and send reply
      const reply = formatReply(workoutData, stats, summary);

      // Attach the updated Excel file
      const excelAttachment = new AttachmentBuilder(excelPath, {
        name: "workout_log.xlsx",
      });

      await message.reply({
        content: reply,
        files: [excelAttachment],
      });

      console.log(`  💬 Reply sent!`);
    } catch (err) {
      console.error("Error processing workout image:", err);
      await message.reply(
        "❌ Error processing your workout image. Check the server logs."
      );
    }
  }
});

async function handleStatsCommand(message) {
  try {
    const stats = await getStats();
    const summary = await getDashboardSummary();

    const lines = [
      "**⚔ SHADOW MONARCH — STATUS REPORT**",
      "",
      `**Today:** ${summary.today.workouts} workout(s), ${summary.today.totalSets} sets, ${summary.today.totalVolume.toLocaleString()} lbs volume`,
      `**This Week:** ${summary.week.workouts} workout(s), ${summary.week.totalSets} sets, ${summary.week.totalVolume.toLocaleString()} lbs volume`,
      `**This Month:** ${summary.month.workouts} workout(s), ${summary.month.totalSets} sets, ${summary.month.totalVolume.toLocaleString()} lbs volume`,
      `**This Year:** ${summary.year.workouts} workout(s), ${summary.year.totalSets} sets, ${summary.year.totalVolume.toLocaleString()} lbs volume`,
      "",
      `**Remaining This Week:**`,
    ];

    if (summary.remaining.length === 0) {
      lines.push("  All workouts complete! 🔥");
    } else {
      for (const r of summary.remaining) {
        lines.push(`  • ${r}`);
      }
    }

    await message.reply(lines.join("\n"));
  } catch (err) {
    console.error("Error getting stats:", err);
    await message.reply("❌ Error fetching stats.");
  }
}

// ── Express health endpoint ──────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "alive", bot: client.user?.tag || "connecting..." });
});

// ── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌐 Health server on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error("Failed to login to Discord:", err.message);
  process.exit(1);
});
