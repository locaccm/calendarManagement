import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
// Si tu as déjà une entité Owner/User, importe-la ici
// import { Owner } from './Owner';

@Entity({ name: 'owner_calendar' })
export class OwnerCalendar {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title!: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: string;

  // @ManyToOne(() => Owner, owner => owner.calendars)
  // owner!: Owner;
}
