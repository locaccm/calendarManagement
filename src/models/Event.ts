import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'event' })
export class Event {
  @PrimaryGeneratedColumn({ name: 'even_id' })
  EVEN_ID!: number;

  @Column({ name: 'evec_lib', type: 'varchar', length: 255 })
  EVEC_LIB!: string;

  @Column({ name: 'eved_start', type: 'date' })
  EVED_START!: string;

  @Column({ name: 'eved_end', type: 'date' })
  EVED_END!: string;

  @Column({ name: 'usen_id', type: 'int' })
  USEN_ID!: number; // Foreign key vers USER

  @Column({ name: 'accn_id', type: 'int' })
  ACCN_ID!: number; // Foreign key vers ACCOMMODATION
}
