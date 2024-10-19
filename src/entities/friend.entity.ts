import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import Common from './common.entity';
import { User } from './user.entity';
import { UserStamp } from './user-stamp.entity';
import { Happ } from './happ.entity';

@Entity()
export class Friend extends Common {
  @Column()
  friendId: string;

  @Column()
  userId: string;

  @Column()
  alias: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'friendId', referencedColumnName: 'id' })
  Friend: User;

  @ManyToMany(() => UserStamp, (stamp) => stamp.Friends, { eager: false })
  UserStamps: UserStamp[];

  @ManyToMany(() => Happ, (happ) => happ.Friends, { eager: false })
  Happs: Happ[];
}
