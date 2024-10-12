import { Column, Entity, ManyToMany } from 'typeorm';
import Common from './common.entity';
import { Happ } from './Happ.entity';
import { UserStamp } from './user-stamp.entity';
import { Stamp } from './stamp.entity';

@Entity()
export class Tag extends Common {
  @Column({
    unique: true,
  })
  name: string;

  @ManyToMany(() => Happ, (happ) => happ.Tags, { eager: false })
  Happs: Happ[];

  @ManyToMany(() => UserStamp, (userStamp) => userStamp.Tags, { eager: false })
  UserStamps: UserStamp[];

  @ManyToMany(() => Stamp, (stamp) => stamp.Tags, { eager: false })
  Stamps: Stamp[];
}
