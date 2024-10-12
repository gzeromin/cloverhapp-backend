import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import Common from './common.entity';
import { Stamp } from './stamp.entity';
import { Tag } from './tag.entity';
import { Friend } from './friend.entity';
import { CounterUnit } from '@/enums/counter-unit.enum';
import { IntervalUnit } from '@/enums/interval-unit.enum';
import { ApiProperty } from '@nestjs/swagger';
import { StampStatus } from '@/enums/stamp-status.enum';
import { Book } from './book.entity';

@Entity()
export class UserStamp extends Common {
  @Column()
  stampId: string;

  @Column()
  userId: string;

  @Column({ default: '0' })
  bookPercent: string;

  @Column()
  alias: string;

  @Column({ nullable: true })
  memo: string | null;

  @Column({ default: true })
  isDisplay: boolean;

  @Column({ default: 1 })
  displayOrder: number;

  @Column({ default: false })
  deleteFlag: boolean;

  @ApiProperty({
    example: '',
    description: '',
    required: true,
  })
  @Column({ default: StampStatus.FRIEND })
  status: StampStatus;

  @ManyToOne(() => Stamp, (icon) => icon.id)
  @JoinColumn({ name: 'stampId', referencedColumnName: 'id' })
  Stamp: Stamp;

  @ManyToMany(() => Tag, { eager: true })
  @JoinTable({
    name: 'user_stamp_tags',
    joinColumn: {
      name: 'user_stamp_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  Tags: Tag[];

  @ManyToMany(() => Friend, { eager: true })
  @JoinTable({
    name: 'user_stamp_friends',
    joinColumn: {
      name: 'user_stamp_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'friend_id',
      referencedColumnName: 'id',
    },
  })
  Friends: Friend[];

  @Column({ default: false })
  existGoal: boolean;

  @Column({ default: CounterUnit.Number })
  goalUnit: CounterUnit;

  @Column({ default: IntervalUnit.Week })
  goalInterval: IntervalUnit;

  @Column({ default: '' })
  goalNumber: string;

  @ManyToOne(() => Book, (book) => book.id, { eager: false })
  @JoinColumn({ name: 'bookId', referencedColumnName: 'id' })
  Book: Book;
}
