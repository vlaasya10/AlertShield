import mongoose, { Schema, HydratedDocument } from "mongoose";

/* -------------------- Interfaces -------------------- */

export interface ILoginHours {
  mean: number;
  std_dev: number;
  typical_range: [number, number];
  timezone: string;
}

export interface IDevice {
  device_id: string;
  type: string;
  os: string;
  first_seen: Date;
  last_seen: Date;
  login_count: number;
}

export interface ILocation {
  city: string;
  country: string;
  first_seen: Date;
  last_seen: Date;
  login_count: number;
}

export interface IStatistics {
  total_logins: number;
  first_login: Date;
  account_age_days: number;
}

export interface IProfile {
  login_hours: ILoginHours;
  devices: IDevice[];
  locations: ILocation[];
  statistics: IStatistics;
}

export interface IUserProfile {
  user_id: string;
  last_updated: Date;
  profile: IProfile;
}

/* -------------------- Document Type -------------------- */

export type UserProfileDocument = HydratedDocument<IUserProfile>;

/* -------------------- Schemas -------------------- */

const loginHoursSchema = new Schema<ILoginHours>(
  {
    mean: { type: Number, required: true },
    std_dev: { type: Number, required: true },
    typical_range: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => v.length === 2,
        message: "typical_range must contain exactly 2 numbers",
      },
    },
    timezone: { type: String, required: true },
  },
  { _id: false },
);

const deviceSchema = new Schema<IDevice>(
  {
    device_id: { type: String, required: true },
    type: { type: String, required: true },
    os: { type: String, required: true },
    first_seen: { type: Date, required: true },
    last_seen: { type: Date, required: true },
    login_count: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const locationSchema = new Schema<ILocation>(
  {
    city: { type: String, required: true },
    country: { type: String, required: true },
    first_seen: { type: Date, required: true },
    last_seen: { type: Date, required: true },
    login_count: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const statisticsSchema = new Schema<IStatistics>(
  {
    total_logins: { type: Number, required: true, default: 0 },
    first_login: { type: Date, required: true },
    account_age_days: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const profileSchema = new Schema<IProfile>(
  {
    login_hours: { type: loginHoursSchema, required: true },
    devices: { type: [deviceSchema], default: [] },
    locations: { type: [locationSchema], default: [] },
    statistics: { type: statisticsSchema, required: true },
  },
  { _id: false },
);

/* -------------------- Main Schema -------------------- */

const userProfileSchema = new Schema<IUserProfile>(
  {
    user_id: { type: String, required: true, unique: true, index: true },
    last_updated: { type: Date, required: true, index: true },
    profile: { type: profileSchema, required: true },
  },
  {
    timestamps: true,
    collection: "user_profiles",
    optimisticConcurrency: true,
  },
);

userProfileSchema.index({ user_id: 1, last_updated: -1 });
userProfileSchema.index({ "profile.devices.device_id": 1 });
userProfileSchema.index({
  "profile.locations.country": 1,
  "profile.locations.city": 1,
});

/* -------------------- Model Export -------------------- */

const UserProfile =
  (mongoose.models.UserProfile as mongoose.Model<IUserProfile>) ||
  mongoose.model<IUserProfile>("UserProfile", userProfileSchema);

export default UserProfile;

