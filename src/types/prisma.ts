// Définition manuelle des types pour les requêtes Prisma

/**
 * Type pour les entrées de fonction avec des dates optionnelles
 * Utilisé pour les fonctions de vérification de conflits et de suggestion de créneaux
 */
export interface EventDateRange {
  ACCN_ID?: number | null;
  USEN_ID?: number | null;
  EVED_START?: Date | string | null;
  EVED_END?: Date | string | null;
}

/**
 * Types pour les requêtes Prisma
 * Définis manuellement pour correspondre aux besoins spécifiques de l'application
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
