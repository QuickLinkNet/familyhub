export interface HolidayRegion { code: string; name: string }

export interface HolidayEventPreview {
  title: string;
  starts_at?: string;
  ends_at?: string;
  startsAt?: string;
  endsAt?: string;
  calendarName?: string;
}

export interface HolidayStatus {
  configured: boolean;
  countryCode: 'DE';
  subdivisionCode: string | null;
  regionName: string | null;
  publicEnabled: boolean;
  schoolEnabled: boolean;
  regions: HolidayRegion[];
  nextEvents: HolidayEventPreview[];
  attributionUrl: string;
}

export interface HolidaySettingsInput {
  subdivisionCode: string;
  publicEnabled: boolean;
  schoolEnabled: boolean;
}

export interface HolidayPreview {
  subdivisionCode: string;
  regionName: string;
  from: string;
  to: string;
  public: HolidayEventPreview[];
  school: HolidayEventPreview[];
}

