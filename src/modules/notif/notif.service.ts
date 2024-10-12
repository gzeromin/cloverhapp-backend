import { Notif } from '@/entities/notif.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestFriendDto } from './dto/request-friend.dto';
import { NotificationType } from '@/enums/notification-type.enum';
import { AcceptRequestDto } from './dto/accept-request.dto';
import { Friend } from '@/entities/friend.entity';

@Injectable()
export class NotifService {
  constructor(
    @InjectRepository(Notif)
    private notifRepository: Repository<Notif>,
  ) {}

  async getSendingNotifs(
    userId: string,
    page: string,
    count: string,
    type: NotificationType,
  ): Promise<Notif[]> {
    const currentPage: number = (page || 0) as number;
    const perPage: number = (count || 10) as number;
    try {
      return await this.notifRepository.find({
        where: { senderId: userId, type },
        relations: ['Receiver'],
        order: { createdAt: 'DESC' },
        skip: currentPage * perPage,
        take: perPage,
      });
    } catch (error) {
      console.log(error);
    }
    return await this.notifRepository.findBy({ senderId: userId });
  }

  async getReceivedNotifs(
    userId: string,
    page: string,
    count: string,
    type: NotificationType,
  ): Promise<Notif[]> {
    const currentPage: number = (page || 0) as number;
    const perPage: number = (count || 3) as number;
    try {
      return await this.notifRepository.find({
        where: { receiverId: userId, type },
        relations: ['Sender'],
        order: { createdAt: 'DESC' },
        skip: currentPage * perPage,
        take: perPage,
      });
    } catch (error) {
      console.log(error);
    }
    return await this.notifRepository.findBy({ senderId: userId });
  }

  async saveFriendNotif(
    requestFriendDto: RequestFriendDto,
    type: NotificationType,
  ): Promise<number> {
    const { senderId, receiverId, myAlias, friendAlias, requestMessage } =
      requestFriendDto;

    const notif = this.notifRepository.create({
      senderId,
      receiverId,
      type,
      property1: myAlias,
      property2: friendAlias,
      property3: requestMessage,
    });

    try {
      const createdNotif = await this.notifRepository.save(notif);
    } catch (error) {
      console.log(error);
    }
    return 0;
  }

  async denyFriendRequest(notifId: string): Promise<number> {
    try {
      const deletedNotif = await this.notifRepository.delete(notifId);
    } catch (error) {
      console.log(error);
    }
    return 0;
  }
}
