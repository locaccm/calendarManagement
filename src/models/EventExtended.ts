import { Event } from './Event';

/**
 * Extended interface for events, including additional properties
 * expected by some integration tests
 */ // Keep ALL_CAPS for DB/API contract fields only
export interface EventExtended extends Event {
  DATE_START?: string;
  DATE_END?: string;
  START_TIME?: string;
  END_TIME?: string;
}
