import { Column, Entity, ManyToMany } from 'typeorm';
import Common from './common.entity';
import { Happ } from './happ.entity';
import { UserStamp } from './user-stamp.entity';
import { Stamp } from './stamp.entity';
import { MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Tag extends Common {
  @ApiProperty({
    description: '태그 이름',
    example: '꾸준히',
    minLength: 1,
    maxLength: 30,
    required: true,
  })
  @Column({
    unique: true,
  })
  @MinLength(1)
  @MaxLength(30)
  name: string;

  @ApiProperty({
    description: '등록된 태그 수',
    example: 3,
    required: false,
  })
  @Column({
    default: 1,
  })
  enrolledCount: number;

  @ManyToMany(() => Happ, (happ) => happ.Tags, { eager: false })
  Happs: Happ[];

  @ManyToMany(() => UserStamp, (userStamp) => userStamp.Tags, { eager: false })
  UserStamps: UserStamp[];

  @ManyToMany(() => Stamp, (stamp) => stamp.Tags, { eager: false })
  Stamps: Stamp[];
}
