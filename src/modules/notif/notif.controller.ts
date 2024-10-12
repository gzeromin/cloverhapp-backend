import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotifService } from './notif.service';
import { RequestFriendDto } from './dto/request-friend.dto';
import { Notif } from '@/entities/notif.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '@/modules/auth/get-user.decorator';
import { User } from '@/entities/user.entity';
import { AcceptRequestDto } from './dto/accept-request.dto';
import { NotificationType } from '@/enums/notification-type.enum';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('notif')
@Controller('notif')
export class NotifController {
  constructor(private notifService: NotifService) {}
  private logger = new Logger('NotifController');

  @Get('/requesting-friends')
  @UseGuards(AuthGuard())
  getRequestingFriends(
    @GetUser() user: User,
    @Query('page') page: string,
    @Query('count') count: string,
  ): Promise<Notif[]> {
    return this.notifService.getSendingNotifs(
      user.id,
      page,
      count,
      NotificationType.REQUEST_FRIEND,
    );
  }

  @Get('/requested-friends')
  @UseGuards(AuthGuard())
  getRequestedFriends(
    @GetUser() user: User,
    @Query('page') page: string,
    @Query('count') count: string,
  ): Promise<Notif[]> {
    return this.notifService.getReceivedNotifs(
      user.id,
      page,
      count,
      NotificationType.REQUEST_FRIEND,
    );
  }

  @Post('/request-friend')
  saveRequestFriend(
    @Body() requestFriendDto: RequestFriendDto,
  ): Promise<number> {
    return this.notifService.saveFriendNotif(
      requestFriendDto,
      NotificationType.REQUEST_FRIEND,
    );
  }

  @Post('/deny-request')
  denyRequest(@Body('notifId') notifId: string): Promise<number> {
    return this.notifService.denyFriendRequest(notifId);
  }
}
