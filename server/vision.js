import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a workout data extraction assistant for "Shadow Monarch OS", a Solo Leveling-themed fitness tracker.

You will receive an image of a workout log/screenshot. Extract ALL workout data into structured JSON.

The user follows the "V-Taper Protocol" split:
- Monday: Back Width + Delts (Lat Pulldown, Chest-Supported Row, Incline DB Press, Lateral Raises, Face Pulls, Curls)
- Tuesday: Lower + Core (Leg Press, RDL, Lunges, Calf Raises, Knee Raises, Side Plank)
- Wednesday: Anime Pump (Cable Fly, Lateral Raises, Rear Delt Fly, Incline Walk)
- Thursday: Chest/Shoulder Pop (Incline Bench, Cable Row, OHP, Lateral Raises, Tricep Pushdown, Cable Fly)

Return ONLY valid JSON in this exact format:
{
  "date": "YYYY-MM-DD",
  "workoutName": "Back Width + Delts",
  "template": "monday",
  "exercises": [
    {
      "name": "Lat Pulldown",
      "sets": [
        { "reps": 10, "weight": 150 },
        { "reps": 8, "weight": 160 }
      ]
    }
  ],
  "notes": "any additional notes from the image",
  "duration_minutes": 60
}

Rules:
- If the date isn't visible, use today's date
- Match exercise names to the V-Taper Protocol when possible
- If the workout doesn't match a template, set template to "custom"
- Weight should be in lbs
- Extract EVERY exercise and set visible in the image
- If you can't determine a value, use reasonable defaults based on the exercise`;

export async function processWorkoutImage(imageUrl) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "url", url: imageUrl },
          },
          {
            type: "text",
            text: "Extract all workout data from this image. Return ONLY the JSON object, no markdown fences.",
          },
        ],
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const text = response.content[0].text.trim();

  // Parse JSON - handle potential markdown fences
  const jsonStr = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "");

  try {
    const data = JSON.parse(jsonStr);

    // Validate required fields
    if (!data.exercises || !Array.isArray(data.exercises)) {
      throw new Error("Missing exercises array");
    }

    // Default date to today if missing
    if (!data.date) {
      data.date = new Date().toISOString().slice(0, 10);
    }

    return data;
  } catch (err) {
    console.error("Failed to parse workout data:", err.message);
    console.error("Raw response:", text);
    return null;
  }
}
