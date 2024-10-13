import * as bcrypt from 'bcryptjs';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Happ } from 'src/entities/Happ.entity';
import { Locale } from 'src/enums/user-locale.enum';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import Common from './common.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User extends Common {
  @ApiProperty({
    description: '닉네임',
    example: 'abcd',
    minLength: 3,
    maxLength: 15,
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
  })
  @IsEmail()
  @Column({
    unique: true,
  })
  email: string;

  @IsString()
  @MinLength(6)
  @Column()
  password: string;

  @Column({
    nullable: true,
  })
  photoUrl: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Member,
  })
  role: UserRole;

  @Column({
    default: Locale.Kr,
  })
  locale: Locale;

  @Column({
    default: 1000,
  })
  droplet: number;

  @Column({
    default: false,
  })
  admin: boolean;

  @Column({ type: 'jsonb', nullable: true })
  keyValues: string[];

  @IsString()
  @Column({
    nullable: true,
  })
  sentence: string | null;

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
