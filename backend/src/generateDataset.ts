import fs from "fs";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
dotenv.config();
const TOTAL = 10000;

const decisions = ["suppress", "review", "escalate"];
const rules = ["AUTH-001", "AUTH-002", "AUTH-003"];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr: string[]) {
  return arr[randomInt(0, arr.length - 1)];
}

const alerts: any[] = [];
const events: any[] = [];
const profiles: Record<string, any> = {};

for (let i = 1; i <= TOTAL; i++) {
  const user_id = `USR${randomInt(1, 1000).toString().padStart(4, "0")}`;
  const alert_id = `ALERT${i.toString().padStart(6, "0")}`;
  const event_id = `EVT${i.toString().padStart(6, "0")}`;

  const risk_score = randomInt(0, 100);

  let decision = "suppress";
  if (risk_score > 75) decision = "escalate";
  else if (risk_score > 40) decision = "review";

  const timestamp = new Date(
    Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000,
  );

  const risk_factors = [
    {
      factor: "new_device",
      points: randomInt(0, 40),
      description: "Device anomaly",
    },
  ];

  const risk_factors_obj = {
    is_new_device: risk_score > 50,
    failed_login_attempts_24h: randomInt(0, 5),
    time_since_last_login_hours: randomInt(0, 72),
    is_threat: risk_score > 85 ? 1 : 0,
  };

  alerts.push({
    alert_id,
    timestamp,
    user_id,
    event_id,
    rule_triggered: randomChoice(rules),
    risk_score,
    decision,
    explanation: `Risk score ${risk_score}/100. Auto generated dataset.`,
    status: "pending",
    risk_factors,
    risk_factors_obj,
  });

  events.push({
    event_id,
    timestamp,
    user_id,
    event_type: "login",
    metadata: {
      device: {
        id: `DEV${randomInt(1, 2000)}`,
        type: randomChoice(["mobile", "desktop", "tablet"]),
        os: randomChoice(["Windows", "macOS", "Linux", "Android", "iOS"]),
        browser: randomChoice(["Chrome", "Edge", "Firefox", "Safari"]),
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
        login_method: randomChoice(["password", "sso", "mfa"]),
      },
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

fs.writeFileSync("alerts_10k.json", JSON.stringify(alerts, null, 2));
fs.writeFileSync("events_10k.json", JSON.stringify(events, null, 2));
fs.writeFileSync(
  "user_profiles_10k.json",
  JSON.stringify(Object.values(profiles), null, 2),
);

console.log("✅ 10K JSON dataset generated successfully.");
