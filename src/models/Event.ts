import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'EVENT' })
export class Event {
  @PrimaryGeneratedColumn({ name: 'EVEN_ID' })
  EVEN_ID!: number;

  @Column({ name: 'EVEC_LIB', type: 'varchar', length: 255 })
  EVEC_LIB!: string;

  @Column({ name: 'EVED_START', type: 'date' })
  EVED_START!: string;

  @Column({ name: 'EVED_END', type: 'date' })
  EVED_END!: string;

  @Column({ name: 'USEN_ID', type: 'int' })
  USEN_ID!: number;

  @Column({ name: 'ACCN_ID', type: 'int' })
  ACCN_ID!: number;
}
