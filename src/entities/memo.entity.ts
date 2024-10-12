import { Column, Entity } from 'typeorm';
import Common from './common.entity';

@Entity()
export class Memo extends Common {
  @Column()
  content: string;

  @Column()
  userId: string;
}
