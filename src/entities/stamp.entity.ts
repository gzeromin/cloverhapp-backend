import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import Common from './common.entity';
import { User } from './user.entity';
import { StampType } from '@/enums/stamp-type.enum';
import { Tag } from './tag.entity';
import { StampStatus } from '@/enums/stamp-status.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Stamp extends Common {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string | null;

  @Column()
  url: string;

  @Column()
  droplet: number;

  @Column({ default: false })
  notForSale: boolean;

  @Column()
  type: StampType;

  @ApiProperty({
    example: '',
    description: '',
    required: true,
  })
  @Column({ default: StampStatus.FRIEND })
  status: StampStatus;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  Register: User;

  @ManyToMany(() => Tag, { eager: true })
  @JoinTable({
    name: 'stamp_tags',
    joinColumn: {
      name: 'stamp_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  Tags: Tag[];
}
