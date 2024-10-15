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
import { Max, MaxLength, MinLength } from 'class-validator';

@Entity()
export class Stamp extends Common {
  @ApiProperty({
    description: '스탬프 이름',
    example: '해피 스탬프',
    minLength: 1,
    maxLength: 20,
    required: true,
  })
  @MinLength(1)
  @MaxLength(20)
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: '스탬프 설명',
    example: '행복할 때마다 스탬프를 찍어요!',
    maxLength: 200,
    required: false,
  })
  @MaxLength(200)
  @Column({ nullable: true })
  description: string | null;

  @ApiProperty({
    description: '스탬프 아이콘 Url',
    required: true,
  })
  @Column()
  url: string;

  @ApiProperty({
    description: '물방울',
    example: 1000,
    maxLength: 999999,
    required: false,
  })
  @Max(999999)
  @Column({ default: 0 })
  droplet: number;

  @ApiProperty({
    description: '비매용',
    example: true,
    required: false,
  })
  @Column({ default: false })
  notForSale: boolean;

  @ApiProperty({
    description: '스탬프 타입',
    example: StampType.HAPPY,
    required: true,
  })
  @Column()
  type: StampType;

  @ApiProperty({
    description: '스탬프 상태',
    example: StampStatus.PUBLIC,
    required: true,
  })
  @Column({ default: StampStatus.FRIEND })
  status: StampStatus;

  @ApiProperty({
    description: '등록자의 uuid',
    required: true,
  })
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
