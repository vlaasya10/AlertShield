// Mock data generator for AlertShield dashboard

export interface RawAlert {
  id: string;
  userId: string;
  eventType: string;
  device: string;
  location: string;
  ruleTriggered: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SmartAlert {
  id: string;
  userId: string;
  riskScore: number;
  decision: 'Suppressed' | 'Escalated';
  explanation: string;
  timestamp: Date;
}

export interface TimeSeriesData {
  date: string;
  rawAlerts: number;
  smartAlerts: number;
}

const eventTypes = [
  'Failed Login Attempt',
  'Unusual Login Location',
  'Multiple Login Attempts',
  'Privilege Escalation',
  'Suspicious File Access',
  'Data Exfiltration Attempt',
  'Malware Detection',
  'Port Scan Detected',
  'SQL Injection Attempt',
  'XSS Attack Detected',
  'Brute Force Attack',
  'Unauthorized API Access',
  'Session Hijacking',
  'Credential Stuffing',
];

const devices = [
  'Windows 10 Desktop',
  'MacBook Pro',
  'iPhone 13',
  'Android Phone',
  'Ubuntu Server',
  'Windows Server 2019',
  'iPad Pro',
  'Linux Workstation',
];

const locations = [
  'New York, US',
  'San Francisco, US',
  'London, UK',
  'Tokyo, JP',
  'Singapore, SG',
  'Frankfurt, DE',
  'Sydney, AU',
  'Toronto, CA',
  'Mumbai, IN',
  'São Paulo, BR',
  'Unknown',
];

const rules = [
  'GEO-001: Geographic Impossible Travel',
  'AUTH-002: Multiple Failed Logins',
  'AUTH-003: Login After Hours',
  'PRIV-001: Unauthorized Privilege Change',
  'DATA-001: Large Data Transfer',
  'MAL-001: Known Malware Signature',
  'NET-001: Unusual Network Activity',
  'FILE-001: Sensitive File Access',
  'API-001: Excessive API Calls',
  'SEC-001: Security Tool Disabled',
];

const explanations = [
  'Geographic location matches user travel history',
  'Login time consistent with work hours',
  'Device previously authenticated for this user',
  'Risk score below escalation threshold',
  'Correlated with legitimate business activity',
  'Multiple authentication factors verified',
  'User behavior matches historical pattern',
  'High risk score - unusual access pattern detected',
  'Failed login from known threat actor IP',
  'Suspicious activity from compromised device',
  'Access pattern indicates credential theft',
  'Critical system access outside business hours',
];

// Generate user IDs
function generateUserId(): string {
  return `USR${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
}

// Generate raw alerts
export function generateRawAlerts(count: number): RawAlert[] {
  const alerts: RawAlert[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const severityRand = Math.random();
    let severity: RawAlert['severity'];
    
    if (severityRand > 0.9) severity = 'critical';
    else if (severityRand > 0.7) severity = 'high';
    else if (severityRand > 0.4) severity = 'medium';
    else severity = 'low';
    
    alerts.push({
      id: `RA${i.toString().padStart(6, '0')}`,
      userId: generateUserId(),
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      ruleTriggered: rules[Math.floor(Math.random() * rules.length)],
      timestamp,
      severity,
    });
  }
  
  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Generate smart alerts (filtered subset)
export function generateSmartAlerts(rawAlerts: RawAlert[]): SmartAlert[] {
  // Smart alerts are about 15-20% of raw alerts (high alert reduction)
  const smartCount = Math.floor(rawAlerts.length * 0.18);
  const smartAlerts: SmartAlert[] = [];
  
  for (let i = 0; i < smartCount; i++) {
    const rawAlert = rawAlerts[i];
    const riskScore = Math.floor(Math.random() * 100);
    const decision = riskScore > 65 ? 'Escalated' : 'Suppressed';
    
    smartAlerts.push({
      id: `SA${i.toString().padStart(6, '0')}`,
      userId: rawAlert.userId,
      riskScore,
      decision,
      explanation: explanations[Math.floor(Math.random() * explanations.length)],
      timestamp: rawAlert.timestamp,
    });
  }
  
  return smartAlerts.sort((a, b) => b.riskScore - a.riskScore);
}

// Generate time series data for charts
export function generateTimeSeriesData(days: number = 30): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const rawAlerts = Math.floor(300 + Math.random() * 200 + Math.sin(i / 3) * 50);
    const smartAlerts = Math.floor(rawAlerts * (0.15 + Math.random() * 0.08));
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rawAlerts,
      smartAlerts,
    });
  }
  
  return data;
}

// Initialize mock data
let rawAlertsData = generateRawAlerts(12000);
let smartAlertsData = generateSmartAlerts(rawAlertsData);
const timeSeriesData = generateTimeSeriesData(30);

export function getRawAlerts(): RawAlert[] {
  return rawAlertsData;
}

export function getSmartAlerts(): SmartAlert[] {
  return smartAlertsData;
}

export function getTimeSeriesData(): TimeSeriesData[] {
  return timeSeriesData;
}

export function generateNewEvents(count: number = 100): void {
  const newRawAlerts = generateRawAlerts(count);
  rawAlertsData = [...newRawAlerts, ...rawAlertsData];
  
  const newSmartAlerts = generateSmartAlerts(newRawAlerts);
  smartAlertsData = [...newSmartAlerts, ...smartAlertsData];
}

export function getMetrics() {
  const totalEvents = rawAlertsData.length;
  const totalRawAlerts = rawAlertsData.length;
  const totalSmartAlerts = smartAlertsData.length;
  const alertReduction = ((1 - totalSmartAlerts / totalRawAlerts) * 100).toFixed(1);
  
  return {
    totalEvents,
    totalRawAlerts,
    totalSmartAlerts,
    alertReduction: parseFloat(alertReduction),
  };
}
