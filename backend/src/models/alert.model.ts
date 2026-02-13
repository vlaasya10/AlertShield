import mongoose, { Schema, Document, Model } from 'mongoose';

// Enums
export type AlertDecision = 'suppress' | 'review' | 'escalate';
export type AlertStatus = 'pending' | 'investigating' | 'resolved' | 'false_positive';

// Interface for risk factor
export interface IRiskFactor {
  factor: string;
  points: number;
  description: string;
}

export interface IRiskFactors {
  is_new_device: boolean;
  failed_login_attempts_24h: number;
  time_since_last_login_hours: number;
  is_threat: number; // 0 or 1
}

// Main Alert interface
export interface IAlert {
  alert_id: string;
  timestamp: Date;
  user_id: string;
  event_id: string;
  rule_triggered: string;
  risk_score: number;
  risk_factors: IRiskFactor[];
  decision: AlertDecision;
  explanation: string;
  status: AlertStatus;
  risk_factors_obj: IRiskFactors;
}

// Alert document interface (includes Mongoose Document methods)
export interface IAlertDocument extends IAlert, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Risk factor schema
const riskFactorSchema = new Schema<IRiskFactor>(
  {
    factor: { type: String, required: true },
    points: { type: Number, required: true },
    description: { type: String, required: true }
  },
  { _id: false }
);

// Risk factors object schema
const riskFactorsObjSchema = new Schema<IRiskFactors>(
  {
    is_new_device: { type: Boolean, default: false, required: true },
    failed_login_attempts_24h: { type: Number, default: 0, required: true },
    time_since_last_login_hours: { type: Number, default: 0, required: true },
    is_threat: { type: Number, default: 0, required: true }
  },
  { _id: false }
);

// Main Alert schema
const alertSchema = new Schema<IAlertDocument>(
  {
    alert_id: {
      type: String,
      required: true,
      unique: true
    },
    timestamp: {
      type: Date,
      required: true,
      index: true
    },
    user_id: {
      type: String,
      required: true,
      index: true
    },
    event_id: {
      type: String,
      required: true,
      index: true
    },
    rule_triggered: {
      type: String,
      required: true
    },
    risk_score: {
      type: Number,
      required: true,
      min: [0, 'Risk score cannot be less than 0'],
      max: [100, 'Risk score cannot be greater than 100']
    },
    risk_factors: {
      type: [riskFactorSchema],
      required: true,
      default: []
    },
    decision: {
      type: String,
      required: true,
      enum: ['suppress', 'review', 'escalate'],
      index: true
    },
    explanation: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'investigating', 'resolved', 'false_positive'],
      default: 'pending'
    },
    risk_factors_obj: {
      type: riskFactorsObjSchema,
      required: true,
      default: () => ({
        is_new_device: false,
        failed_login_attempts_24h: 0,
        time_since_last_login_hours: 0,
        is_threat: 0
      })
    }
  },
  {
    timestamps: true,
    collection: 'alerts'
  }
);

// Compound index for risk score and decision queries
alertSchema.index({ risk_score: -1, decision: 1 });

// Compound index for user time-series queries
alertSchema.index({ user_id: 1, timestamp: -1 });

// Export model safely to avoid OverwriteModelError
const Alert: Model<IAlertDocument> = 
  mongoose.models.Alert || mongoose.model<IAlertDocument>('Alert', alertSchema);

export default Alert;
