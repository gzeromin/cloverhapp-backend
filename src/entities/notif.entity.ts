import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import Common from './common.entity';
import { User } from './user.entity';
import { NotificationType } from '@/enums/notification-type.enum';

@Entity()
export class Notif extends Common {
  @Column()
  senderId: string;

  @Column()
  receiverId: string;

  @Column()
  type: NotificationType;

  @Column({ nullable: true })
  property1: string;

  @Column({ nullable: true })
  property2: string;

  @Column({ nullable: true })
  property3: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'senderId', referencedColumnName: 'id' })
  Sender: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'receiverId', referencedColumnName: 'id' })
  Receiver: User;
}
