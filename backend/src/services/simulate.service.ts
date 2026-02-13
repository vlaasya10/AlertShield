import Event from "../models/event.model";
import alertService from "./alert.service";
import profileService from "./profile.service";
import riskService from "./risk.service";
import { randomUUID } from "crypto";

interface SimResult {
  eventsCreated: number;
  alertsCreated: number;
  suppressedEvents: number;
}

const CITIES = [
  { city: "New York", country: "USA" },
  { city: "London", country: "UK" },
  { city: "Berlin", country: "Germany" },
  { city: "Tokyo", country: "Japan" },
  { city: "Sydney", country: "Australia" },
  { city: "Paris", country: "France" },
  { city: "Toronto", country: "Canada" },
  { city: "Mumbai", country: "India" },
  { city: "Singapore", country: "Singapore" },
  { city: "Dubai", country: "UAE" },
];

const DEVICE_TYPES = ["mobile", "desktop", "tablet"];
const OS_LIST = ["iOS", "Android", "Windows", "macOS", "Linux"];
const BROWSERS = ["Chrome", "Firefox", "Safari", "Edge", "Opera"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomArrayItem<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

export class SimulateService {
  async simulateEvents(count: number): Promise<SimResult> {
    let eventsCreated = 0;
    let alertsCreated = 0;
    let suppressedEvents = 0;

    // Baseline behavioral profile per user
    const userProfiles: Record<
      string,
      {
        device_id: string;
        city: string;
        country: string;
        typicalHours: [number, number];
      }
    > = {};

    for (let i = 1; i <= 100; i++) {
      const user_id = `USR${i.toString().padStart(4, "0")}`;
      userProfiles[user_id] = {
        device_id: `DEV${randomInt(1, 100).toString().padStart(4, "0")}`,
        ...randomArrayItem(CITIES),
        typicalHours: [8, 18],
      };
    }

    for (let i = 0; i < count; i++) {
      // Risk type distribution
      const rand = Math.random();
      let riskType: "normal" | "moderate" | "high";
      if (rand < 0.4) riskType = "normal";
      else if (rand < 0.8) riskType = "moderate";
      else riskType = "high";

      const userNum = randomInt(1, 100);
      const user_id = `USR${userNum.toString().padStart(4, "0")}`;
      const userProfile = userProfiles[user_id];

      let { device_id, city, country } = userProfile;

      let hour = randomInt(
        userProfile.typicalHours[0],
        userProfile.typicalHours[1],
      );

      // -------------------------
      // 1️⃣ Multi-day distribution
      // -------------------------
      const timestamp = new Date();
      const daysAgo = randomInt(0, 29);
      timestamp.setDate(timestamp.getDate() - daysAgo);

      // -------------------------
      // 2️⃣ Failed login simulation
      // -------------------------
      let failedAttempts = 0;

      if (riskType === "moderate") {
        const anomaly = randomInt(1, 4);
        if (anomaly === 1) {
          device_id = `DEV${randomInt(101, 999).toString().padStart(4, "0")}`;
        } else if (anomaly === 2) {
          const loc = randomArrayItem(CITIES.filter((c) => c.city !== city));
          city = loc.city;
          country = loc.country;
        } else if (anomaly === 3) {
          hour = randomInt(0, 7);
        } else {
          failedAttempts = randomInt(2, 5);
        }
      }

      if (riskType === "high") {
        device_id = `DEV${randomInt(101, 999).toString().padStart(4, "0")}`;
        const loc = randomArrayItem(CITIES.filter((c) => c.city !== city));
        city = loc.city;
        country = loc.country;
        hour = randomInt(0, 6);
        failedAttempts = randomInt(5, 15);
      }

      timestamp.setHours(hour, randomInt(0, 59), randomInt(0, 59), 0);

      // -------------------------
      // 3️⃣ Rare known threat IP
      // -------------------------
      const isThreatIP = Math.random() < 0.05 ? 1 : 0;

      const eventData = {
        event_id: randomUUID(),
        timestamp,
        user_id,
        event_type: "login",
        metadata: {
          device: {
            id: device_id,
            type: randomArrayItem(DEVICE_TYPES),
            os: randomArrayItem(OS_LIST),
            browser: randomArrayItem(BROWSERS),
          },
          location: {
            ip: `192.168.${randomInt(0, 255)}.${randomInt(0, 255)}`,
            city,
            country,
            latitude: randomInt(-90, 90) + Math.random(),
            longitude: randomInt(-180, 180) + Math.random(),
            is_threat: isThreatIP,
          },
          session: {
            session_id: randomUUID(),
            login_method: "password",
            failed_login_attempts_24h: failedAttempts,
          },
        },
      };

      // -------------------------
      // 4️⃣ Burst login scenario
      // -------------------------
      const burstCount = Math.random() < 0.08 ? randomInt(3, 8) : 1;

      for (let b = 0; b < burstCount; b++) {
        const burstTimestamp = new Date(timestamp);
        burstTimestamp.setMinutes(burstTimestamp.getMinutes() + b);

        const burstEvent = await Event.create({
          ...eventData,
          event_id: randomUUID(),
          timestamp: burstTimestamp,
        });

        eventsCreated++;

        const profile = await profileService.getOrCreateProfile(
          user_id,
          eventData,
        );
        const risk = await riskService.assessRisk(profile, eventData);
        await profileService.updateProfile(user_id, eventData, profile);

        if (risk.risk_score > 0) {
          await alertService.createAlertIfNeeded(
            user_id,
            burstEvent.event_id,
            risk,
          );
          alertsCreated++;
          if (risk.decision === "suppress") suppressedEvents++;
        }
      }
    }

    return { eventsCreated, alertsCreated, suppressedEvents };
  }
}

export default new SimulateService();
