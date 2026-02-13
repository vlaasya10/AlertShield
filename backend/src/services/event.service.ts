import Event, { IEventDocument } from '../models/event.model';

export interface IEventFilters {
  user_id?: string;
  event_type?: string;
}

export interface IPaginationOptions {
  page: number;
  limit: number;
}

export interface IFlattenedEvent {
  user_id: string;
  event_type: string;
  device_type: string;
  city: string;
  country: string;
  timestamp: Date;
}

export interface IPaginatedResponse {
  data: IFlattenedEvent[];
  total: number;
  page: number;
  pages: number;
}

export class EventService {
  /**
   * Get events with pagination and filters
   */
  async getEvents(
    filters: IEventFilters,
    pagination: IPaginationOptions
  ): Promise<{
    data: IFlattenedEvent[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  }> {
    // Build query
    const query: Record<string, unknown> = {};
    if (filters.user_id) {
      query.user_id = filters.user_id;
    }
    if (filters.event_type) {
      query.event_type = filters.event_type;
    }
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(query)
    ]);
    const flattenedEvents = events.map(event => this.flattenEvent(event));
    return {
      data: flattenedEvents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Flatten event for frontend consumption
   */
  private flattenEvent(event: IEventDocument): IFlattenedEvent {
    return {
      user_id: event.user_id,
      event_type: event.event_type,
      device_type: event.metadata.device.type,
      city: event.metadata.location.city,
      country: event.metadata.location.country,
      timestamp: event.timestamp
    };
  }
}

export default new EventService();
