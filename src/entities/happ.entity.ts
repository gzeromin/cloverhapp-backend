import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import Common from './common.entity';
import { UserStamp } from './user-stamp.entity';
import { Friend } from './friend.entity';
import { Tag } from './tag.entity';
import { Book } from './book.entity';
import { User } from './user.entity';
import { StampStatus } from '@/enums/stamp-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { TodoStatus } from '@/enums/todo-status.enum';
import { MoneyUnit } from '@/enums/money-unit.enum';
import { IsNotEmpty } from 'class-validator';
import { Comment } from './comment.entity';

@Entity()
export class Happ extends Common {
  @Column()
  userStampId: string;

  @Column()
  userId: string;

  @Column({ default: '0' })
  bookPercent: string;

  @Column()
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column('double precision')
  positionX: number;

  @Column('double precision')
  positionY: number;

  @IsNotEmpty()
  @ApiProperty({
    example: '',
    description: '',
  })
  @Column({ nullable: true })
  memo: string;

  @Column({ nullable: true })
  money: string;

  @Column({ nullable: true })
  moneyUnit: MoneyUnit;

  @Column({ nullable: true })
  water: string;

  @Column({ default: TodoStatus.NOT_TODO })
  todo: TodoStatus;

  @Column({ type: 'jsonb', nullable: true })
  imageUrls: string[];

  @ApiProperty({
    example: '',
    description: '',
    required: true,
  })
  @Column({ default: StampStatus.FRIEND })
  status: StampStatus;

  @ManyToOne(() => User, (user) => user.id, { eager: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  User: User;

  @ManyToOne(() => Book, (book) => book.id, { eager: false })
  @JoinColumn({ name: 'bookId', referencedColumnName: 'id' })
  Book: Book;

  @ManyToMany(() => Tag, { eager: true })
  @JoinTable({
    name: 'happs_tags',
    joinColumn: {
      name: 'happ_id',
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
    name: 'happ_friends',
    joinColumn: {
      name: 'happ_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'friend_id',
      referencedColumnName: 'id',
    },
  })
  Friends: Friend[];

  @ManyToOne(() => UserStamp, (userStamp) => userStamp.id, { eager: false })
  @JoinColumn({ name: 'userStampId', referencedColumnName: 'id' })
  UserStamp: UserStamp;

  @OneToMany(() => Comment, (comment) => comment.Happ, { cascade: true })
  Comments: Comment[];
}
