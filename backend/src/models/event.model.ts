import mongoose, { Schema, Document, Model } from 'mongoose';

// Enums
export type EventType = 'login' | 'device_change' | 'location_change';
export type DeviceType = 'mobile' | 'desktop' | 'tablet';
export type LoginMethod = 'password' | 'sso' | 'mfa';

// Interface for nested metadata structures
export interface IDevice {
  id: string;
  type: DeviceType;
  os: string;
  browser: string;
}

export interface ILocation {
  ip: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface ISession {
  session_id: string;
  login_method: LoginMethod;
}

export interface IMetadata {
  device: IDevice;
  location: ILocation;
  session: ISession;
}

// Main Event interface
export interface IEvent {
  event_id: string;
  timestamp: Date;
  user_id: string;
  event_type: EventType;
  metadata: IMetadata;
}

// Event document interface (includes Mongoose Document methods)
export interface IEventDocument extends IEvent, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Device schema
const deviceSchema = new Schema<IDevice>(
  {
    id: { type: String, required: true },
    type: { 
      type: String, 
      required: true,
      enum: ['mobile', 'desktop', 'tablet']
    },
    os: { type: String, required: true },
    browser: { type: String, required: true }
  },
  { _id: false }
);

// Location schema
const locationSchema = new Schema<ILocation>(
  {
    ip: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  { _id: false }
);

// Session schema
const sessionSchema = new Schema<ISession>(
  {
    session_id: { type: String, required: true },
    login_method: { 
      type: String, 
      required: true,
      enum: ['password', 'sso', 'mfa']
    }
  },
  { _id: false }
);

// Metadata schema
const metadataSchema = new Schema<IMetadata>(
  {
    device: { type: deviceSchema, required: true },
    location: { type: locationSchema, required: true },
    session: { type: sessionSchema, required: true }
  },
  { _id: false }
);

// Main Event schema
const eventSchema = new Schema<IEventDocument>(
  {
    event_id: {
      type: String,
      required: true,
      unique: true
    },
    timestamp: {
      type: Date,
      required: true
    },
    user_id: {
      type: String,
      required: true
    },
    event_type: {
      type: String,
      required: true,
      enum: ['login', 'device_change', 'location_change']
    },
    metadata: {
      type: metadataSchema,
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'events'
  }
);

// Compound index for efficient time-series queries
eventSchema.index({ user_id: 1, timestamp: -1 });

// TTL index for 90-day retention policy (90 days = 7776000 seconds)
eventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// Export model safely to avoid OverwriteModelError
const Event: Model<IEventDocument> = 
  mongoose.models.Event || mongoose.model<IEventDocument>('Event', eventSchema);

export default Event;
