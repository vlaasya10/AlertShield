import mongoose from "mongoose";
import { randomUUID } from "crypto";
import Alert from "../models/alert.model";
import Event from "../models/event.model";
import UserProfile from "../models/userProfile.model";

const TOTAL = 10000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Somu_Joshi_:SomuJoshi123@cluster0.ffwkwgv.mongodb.net/?appName=Cluster0&authSource=admin&replicaSet=atlas-13l5s8-shard-0&w=majority";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const alerts = [];
  const events = [];
  const profiles: Record<string, any> = {};

  for (let i = 1; i <= TOTAL; i++) {
    const user_id = `USR${randomInt(1, 1000).toString().padStart(4, "0")}`;
    const event_id = randomUUID();
    const alert_id = randomUUID();
    const risk_score = randomInt(0, 100);

    let decision: "suppress" | "review" | "escalate" = "suppress";
    if (risk_score > 75) decision = "escalate";
    else if (risk_score > 40) decision = "review";

    const timestamp = new Date();

    events.push({
      event_id,
      timestamp,
      user_id,
      event_type: "login",
      metadata: {
        device: {
          id: `DEV${randomInt(1, 2000)}`,
          type: "mobile",
          os: "Windows",
          browser: "Chrome",
        },
        location: {
          ip: `192.168.${randomInt(0, 255)}.${randomInt(0, 255)}`,
          city: "Berlin",
          country: "Germany",
          latitude: 52.52,
          longitude: 13.4,
        },
        session: {
          session_id: randomUUID(),
          login_method: "password",
        },
      },
    });

    alerts.push({
      alert_id,
      timestamp,
      user_id,
      event_id,
      rule_triggered: "AUTH-001",
      risk_score,
      decision,
      explanation: `Risk score ${risk_score}/100`,
      status: "pending",
      risk_factors: [
        {
          factor: "new_device",
          points: 30,
          description: "Device anomaly",
        },
      ],
      risk_factors_obj: {
        is_new_device: risk_score > 50,
        failed_login_attempts_24h: randomInt(0, 5),
        time_since_last_login_hours: randomInt(0, 72),
        is_threat: risk_score > 85 ? 1 : 0,
      },
    });

    if (!profiles[user_id]) {
      profiles[user_id] = {
        user_id,
        last_updated: timestamp,
        profile: {
          login_hours: {
            mean: 9,
            std_dev: 1,
            typical_range: [7, 11],
            timezone: "UTC",
          },
          devices: [],
          locations: [],
          statistics: {
            total_logins: 1,
            first_login: timestamp,
            account_age_days: 0,
          },
        },
      };
    }
  }

  console.log("⏳ Inserting alerts...");
  await Alert.insertMany(alerts);

  console.log("⏳ Inserting events...");
  await Event.insertMany(events);

  console.log("⏳ Inserting profiles...");
  await UserProfile.insertMany(Object.values(profiles));

  console.log("🚀 10K dataset inserted successfully");

  await mongoose.disconnect();
}

seed().catch(console.error);
