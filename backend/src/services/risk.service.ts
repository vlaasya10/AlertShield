import { UserProfileDocument } from '../models/userProfile.model';
import profileService from './profile.service';

export interface IRiskFactor {
  factor: string;
  points: number;
  description: string;
}

export interface IRiskAssessment {
  risk_score: number;
  decision: 'suppress' | 'review' | 'escalate';
  risk_factors: IRiskFactor[];
  explanation: string;
  rule_triggered: string;
}

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

export class RiskService {
  /**
   * Calculate risk score and determine decision
   */
  async assessRisk(profile: UserProfileDocument, eventData: IEventData): Promise<IRiskAssessment> {
    const riskFactors: IRiskFactor[] = [];
    let riskScore = 0;

    // Check if new user
    if (profileService.isNewUser(profile)) {
      riskScore += 10;
      riskFactors.push({
        factor: 'new_user',
        points: 10,
        description: 'First login for this user account'
      });
    }

    // Check if new device
    if (profileService.isNewDevice(profile, eventData.metadata.device.id)) {
      riskScore += 35;
      riskFactors.push({
        factor: 'new_device',
        points: 35,
        description: `Unrecognized device: ${eventData.metadata.device.type} - ${eventData.metadata.device.os}`
      });
    }

    // Check if new location
    if (profileService.isNewLocation(profile, eventData.metadata.location.city, eventData.metadata.location.country)) {
      riskScore += 30;
      riskFactors.push({
        factor: 'new_location',
        points: 30,
        description: `Unrecognized location: ${eventData.metadata.location.city}, ${eventData.metadata.location.country}`
      });
    }

    // Check if anomalous login hour
    if (profileService.isAnomalousLoginHour(profile, eventData.timestamp)) {
      riskScore += 22;
      const hour = eventData.timestamp.getHours();
      const [minHour, maxHour] = profile.profile.login_hours.typical_range;
      riskFactors.push({
        factor: 'anomalous_time',
        points: 22,
        description: `Login at unusual hour ${hour}:00 (typical range: ${minHour.toFixed(1)}-${maxHour.toFixed(1)})`
      });
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    // Determine decision based on risk score
    const decision = this.determineDecision(riskScore);

    // Generate explanation
    const explanation = this.generateExplanation(riskScore, riskFactors, decision);

    // Determine rule triggered
    const ruleTriggered = this.determineRuleTriggered(riskFactors);

    return {
      risk_score: riskScore,
      decision,
      risk_factors: riskFactors,
      explanation,
      rule_triggered: ruleTriggered
    };
  }

  /**
   * Determine decision based on risk score thresholds
   */
  private determineDecision(riskScore: number): 'suppress' | 'review' | 'escalate' {
    if (riskScore >= 70) {
      return 'escalate';
    } else if (riskScore >= 31) {
      return 'review';
    } else {
      return 'suppress';
    }
  }

  /**
   * Generate human-readable explanation
   */
  private generateExplanation(
    riskScore: number,
    riskFactors: IRiskFactor[],
    decision: string
  ): string {
    if (riskFactors.length === 0) {
      return 'Login appears normal. No anomalies detected.';
    }

    const factorDescriptions = riskFactors.map(rf => rf.factor).join(', ');
    const actionText = decision === 'escalate' 
      ? 'Immediate review required.' 
      : decision === 'review' 
      ? 'Manual review recommended.' 
      : 'Monitoring only.';

    return `Risk score ${riskScore}/100. Detected: ${factorDescriptions}. ${actionText}`;
  }

  /**
   * Determine which rule was triggered
   */
  private determineRuleTriggered(riskFactors: IRiskFactor[]): string {
    if (riskFactors.length === 0) {
      return 'baseline_check';
    }

    const factors = riskFactors.map(rf => rf.factor);

    if (factors.includes('new_device') && factors.includes('new_location')) {
      return 'multi_factor_anomaly';
    } else if (factors.includes('new_device')) {
      return 'device_anomaly';
    } else if (factors.includes('new_location')) {
      return 'location_anomaly';
    } else if (factors.includes('anomalous_time')) {
      return 'temporal_anomaly';
    } else if (factors.includes('new_user')) {
      return 'new_account';
    } else {
      return 'behavioral_anomaly';
    }
  }
}

export default new RiskService();
