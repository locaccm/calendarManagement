// Manual type definitions for Prisma queries

/**
 * Type for function inputs with optional dates
 * Used for conflict checking and time slot suggestion functions
 */
export interface EventDateRange {
  ACCN_ID?: number | null;
  USEN_ID?: number | null;
  EVED_START?: Date | string | null;
  EVED_END?: Date | string | null;
}

/**
 * Types for Prisma queries
 * Manually defined to match specific application needs
 */
export interface EventWhereInput {
  EVEN_ID?: number | { equals?: number; in?: number[] };
  EVEC_LIB?: string | { contains?: string };
  EVED_START?: Date | { gte?: Date; lte?: Date };
  EVED_END?: Date | { gte?: Date; lte?: Date };
  USEN_ID?: number | { equals?: number };
  ACCN_ID?: number | { equals?: number };
  OR?: EventWhereInput[];
  NOT?: EventWhereInput;
}

export interface EventOrderByWithRelationInput {
  EVEN_ID?: 'asc' | 'desc';
  EVED_START?: 'asc' | 'desc';
  EVED_END?: 'asc' | 'desc';
}

export interface EventCreateInput {
  EVEC_LIB?: string;
  EVED_START?: Date;
  EVED_END?: Date;
  USEN_ID?: number;
  ACCN_ID?: number;
}

export interface EventUpdateInput {
  EVEC_LIB?: string;
  EVED_START?: Date;
  EVED_END?: Date;
  USEN_ID?: number;
  ACCN_ID?: number;
}
