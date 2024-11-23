import * as bcrypt from 'bcryptjs';
import { Allow, IsEmail, IsString, Max, MaxLength, MinLength } from 'class-validator';
import { Locale } from 'src/enums/user-locale.enum';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import Common from './common.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Happ } from './happ.entity';

@Entity()
export class User extends Common {
  @ApiProperty({
    description: '닉네임',
    example: 'abcd',
    minLength: 3,
    maxLength: 15,
    required: true,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @Column({
    unique: true,
  })
  nickname: string;

  @ApiProperty({
    description: '이메일',
    example: 'abcd@abcd.abcd',
    required: true,
  })
  @IsEmail()
  @Column({
    unique: true,
  })
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'abcdefghijklmn',
    minLength: 6,
    required: true,
  })
  @IsString()
  @MinLength(6)
  @Column()
  password: string;

  @ApiProperty({
    description: '프로필 사진 url',
    required: false,
  })
  @Column({
    nullable: true,
  })
  photoUrl: string | null;

  @ApiProperty({
    description: '사용자 역할',
    example: UserRole.Member,
    enum: UserRole,
    required: false,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Member,
  })
  role: UserRole;

  @ApiProperty({
    description: '언어',
    example: Locale.Kr,
    enum: Locale,
    required: true,
  })
  @Allow()
  @Column({
    default: Locale.Kr,
  })
  locale: Locale;

  @ApiProperty({
    description: '물방울, 햅탬프에서 거래시 사용',
    maximum: 9999999999,
  })
  @Max(9999999999)
  @Column({
    default: 1000,
  })
  droplet: number;

  @ApiProperty({
    description: '핵심가치',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  keyValues: string[];

  @ApiProperty({
    description: '나의 한문장',
    required: false,
  })
  @IsString()
  @MaxLength(300)
  @Column({
    nullable: true,
  })
  sentence: string | null;

  @ApiProperty({
    description: '알림 갯수',
  })
  notifNum: number;

  // eager: true -> user를 가져올때 happ 모두 가져옴
  @OneToMany(() => Happ, (happ) => happ.User, { eager: false })
  Happs: Happ[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
}
