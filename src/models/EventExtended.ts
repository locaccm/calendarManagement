import { Event } from './Event';

/**
 * Interface étendue pour les événements, incluant les propriétés supplémentaires
 * attendues par certains tests d'intégration
 */
export interface EventExtended extends Event {
  DATE_START?: string;
  DATE_END?: string;
  START_TIME?: string;
  END_TIME?: string;
}
