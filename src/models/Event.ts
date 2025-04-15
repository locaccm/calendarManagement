import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  EVEN_ID!: number;

  @Column({ length: 255 })
  EVEC_LIB!: string;

  @Column({ type: 'date' })
  EVED_START!: string;

  @Column({ type: 'date' })
  EVED_END!: string;

  @Column()
  USEN_ID!: number; // Foreign key vers USER

  @Column()
  ACCN_ID!: number; // Foreign key vers ACCOMMODATION
}
