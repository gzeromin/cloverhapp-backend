import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import Common from './common.entity';
import { User } from './user.entity';
import { Happ } from './Happ.entity';

@Entity()
export class Comment extends Common {
  @Column()
  happId: string;

  @Column({ length: 400 })
  body: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  User: User;

  @ManyToOne(() => Happ, (happ) => happ.Comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'happId', referencedColumnName: 'id' })
  Happ: Happ;
}
