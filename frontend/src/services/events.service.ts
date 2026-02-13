import api from './api';

export interface RawEvent {
  user_id: string;
  event_type: string;
  device_type: string;
  city: string;
  country: string;
  timestamp: string;
}

export interface EventsResponse {
  data: RawEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const eventsService = {
  async getEvents(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<EventsResponse> {
    const { data } = await api.get<EventsResponse>('/events', { params });
    return data;
  }
};

export default eventsService;
