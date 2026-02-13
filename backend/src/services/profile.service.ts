
import UserProfile, { UserProfileDocument } from "../models/userProfile.model";

interface IEventData {
  user_id: string;
  timestamp: Date;
  event_type: string;
  metadata: {
    device: {
      id: string;
      type: string;
      os: string;
      browser: string;
    };
    location: {
      ip: string;
      city: string;
      country: string;
      latitude: number;
      longitude: number;
    };
    session: {
      session_id: string;
      login_method: string;
    };
  };
}

export class ProfileService {
  /**
   * Get or create user profile
   */
  async getOrCreateProfile(userId: string, eventData: IEventData): Promise<UserProfileDocument> {
    let profile = await UserProfile.findOne({ user_id: userId });

    if (!profile) {
      profile = await this.createBaselineProfile(userId, eventData);
    }

    return profile;
  }

  /**
   * Create baseline profile for new user
   */
  private async createBaselineProfile(userId: string, eventData: IEventData): Promise<UserProfileDocument> {
    const hour = eventData.timestamp.getHours();
    
    return await UserProfile.create({
      user_id: userId,
      last_updated: eventData.timestamp,
      profile: {
        login_hours: {
          mean: hour,
          std_dev: 0,
          typical_range: [hour, hour],
          timezone: "UTC",
        },
        devices: [
          {
            device_id: eventData.metadata.device.id,
            type: eventData.metadata.device.type,
            os: eventData.metadata.device.os,
            first_seen: eventData.timestamp,
            last_seen: eventData.timestamp,
            login_count: 1,
          },
        ],
        locations: [
          {
            city: eventData.metadata.location.city,
            country: eventData.metadata.location.country,
            first_seen: eventData.timestamp,
            last_seen: eventData.timestamp,
            login_count: 1,
          },
        ],
        statistics: {
          total_logins: 1,
          first_login: eventData.timestamp,
          account_age_days: 0,
        },
      },
    });
  }

  /**
   * Update profile based on new event
   */
  async updateProfile(
    userId: string,
    eventData: IEventData,
    existingProfile?: UserProfileDocument
  ): Promise<UserProfileDocument> {
    const profile = existingProfile ?? await UserProfile.findOne({ user_id: userId });

    if (!profile) {
      throw new Error('Profile not found');
    }

    if (eventData.event_type === 'login') {
      // Update login hour statistics
      this.updateLoginHourStats(profile, eventData.timestamp);

      // Update or add device
      this.updateDevice(profile, eventData);

      // Update or add location
      this.updateLocation(profile, eventData);

      // Update statistics
      profile.profile.statistics.total_logins += 1;
      profile.profile.statistics.account_age_days = Math.floor(
        (eventData.timestamp.getTime() - profile.profile.statistics.first_login.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    profile.last_updated = eventData.timestamp;
    await profile.save();

    return profile;
  }

  /**
   * Update login hour statistics with running mean and std deviation
   */
  private updateLoginHourStats(profile: UserProfileDocument, timestamp: Date): void {
    const hour = timestamp.getHours();
    const loginHours = profile.profile.login_hours;
    const n = profile.profile.statistics.total_logins;

    // Calculate new mean using running average formula
    const oldMean = loginHours.mean;
    const newMean = oldMean + (hour - oldMean) / (n + 1);

    // Calculate new standard deviation using Welford's online algorithm
    const oldStdDev = loginHours.std_dev;
    const newStdDev = n > 0 
      ? Math.sqrt(((n - 1) * oldStdDev * oldStdDev + (hour - oldMean) * (hour - newMean)) / n)
      : 0;

    loginHours.mean = newMean;
    loginHours.std_dev = newStdDev;
    loginHours.typical_range = [
      Math.max(0, newMean - 2 * newStdDev),
      Math.min(23, newMean + 2 * newStdDev)
    ];
  }

  /**
   * Update or add device to profile
   */
  private updateDevice(profile: UserProfileDocument, eventData: IEventData): void {
    const deviceId = eventData.metadata.device.id;
    const existingDevice = profile.profile.devices.find(d => d.device_id === deviceId);

    if (existingDevice) {
      existingDevice.last_seen = eventData.timestamp;
      existingDevice.login_count += 1;
    } else {
      profile.profile.devices.push({
        device_id: deviceId,
        type: eventData.metadata.device.type,
        os: eventData.metadata.device.os,
        first_seen: eventData.timestamp,
        last_seen: eventData.timestamp,
        login_count: 1
      });
    }
  }

  /**
   * Update or add location to profile
   */
  private updateLocation(profile: UserProfileDocument, eventData: IEventData): void {
    const { location } = eventData.metadata;
    const { city, country } = location;

    const existingLocation = profile.profile.locations.find(
      l => l.city === city && l.country === country
    );

    if (existingLocation) {
      existingLocation.last_seen = eventData.timestamp;
      existingLocation.login_count += 1;
    } else {
      profile.profile.locations.push({
        city,
        country,
        first_seen: eventData.timestamp,
        last_seen: eventData.timestamp,
        login_count: 1
      });
    }
  }

  /**
   * Check if device is new
   */
  isNewDevice(profile: UserProfileDocument, deviceId: string): boolean {
    return !profile.profile.devices.some(d => d.device_id === deviceId);
  }

  /**
   * Check if location is new
   */
  isNewLocation(profile: UserProfileDocument, city: string, country: string): boolean {
    return !profile.profile.locations.some(l => l.city === city && l.country === country);
  }

  /**
   * Check if login hour is outside typical range
   */
  isAnomalousLoginHour(profile: UserProfileDocument, timestamp: Date): boolean {
    const hour = timestamp.getHours();
    const loginHours = profile.profile.login_hours;
    const [minHour, maxHour] = loginHours.typical_range;

    return hour < minHour || hour > maxHour;
  }

  /**
   * Check if user is new (first login)
   */
  isNewUser(profile: UserProfileDocument): boolean {
    return profile.profile.statistics.total_logins === 1;
  }
}

export default new ProfileService();
