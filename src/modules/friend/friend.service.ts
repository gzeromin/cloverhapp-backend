import { Friend } from '@/entities/friend.entity';
import { Notif } from '@/entities/notif.entity';
import { User } from '@/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcceptRequestDto } from './dto/accept-request.dto';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(Notif)
    private notifRepository: Repository<Notif>,
  ) {}

  async getFriendsByUserId(
    userId: string,
    page: string,
    term: string,
  ): Promise<Friend[]> {
    const currentPage: number = (page || 0) as number;
    const perPage = 10;
    try {
      const query = this.friendRepository
        .createQueryBuilder('friend')
        .where({
          userId,
        })
        .leftJoinAndSelect('friend.Friend', 'Friend')
        .orderBy({ 'Friend.nickname': 'ASC' })
        .skip(currentPage * perPage)
        .take(perPage);

      if (term) {
        query.where(
          `friend.userId = :userId AND (Friend.nickname ILIKE :term OR Friend.email ILIKE :term)`,
          {
            userId,
            term: `%${term}%`,
          },
        );
      }
      return await query.getMany();
    } catch (error) {
      console.log(error);
    }
  }

  async getOneFriend(userId: string, friendId: string): Promise<Friend> {
    try {
      const friend = await this.friendRepository.findOneBy({
        userId,
        friendId,
      });
      return friend;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteFriend(user: User, friendId: string): Promise<number> {
    try {
      const res1 = await this.friendRepository.delete({
        userId: user.id,
        friendId,
      });
      const res2 = await this.friendRepository.delete({
        userId: friendId,
        friendId: user.id,
      });
    } catch (error) {
      // TODO
    }

    return 0;
  }

  async acceptFriendRequest(
    acceptRequestDto: AcceptRequestDto,
  ): Promise<number> {
    const { id, senderId, receiverId, myAlias, friendAlias } = acceptRequestDto;
    try {
      // 1. 요청 보낸사람 친구 저장
      const senderIcon = this.friendRepository.create({
        friendId: receiverId,
        userId: senderId,
        alias: friendAlias,
      });
      await this.friendRepository.save(senderIcon);

      // 2. 요청 받은사람 친구 저장
      const receiverIcon = this.friendRepository.create({
        friendId: senderId,
        userId: receiverId,
        alias: myAlias,
      });
      await this.friendRepository.save(receiverIcon);

      // 3. 알림 삭제
      const deletedNotif = await this.notifRepository.delete(id);
    } catch (error) {
      console.log(error);
    }
    return 0;
  }
}
