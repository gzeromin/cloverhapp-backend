import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Notif } from '@/entities/notif.entity';

// 어디서나 주입해서 쓸 수 있게 하기 위해서
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Notif) private notifRepository: Repository<Notif>,
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET_KEY,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.token;
        },
      ]),
    });
  }

  async validate(payload) {
    const { email } = payload;
    const user: User = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new UnauthorizedException();
    }

    const notifNum = await this.notifRepository.countBy({
      receiverId: user.id,
    });
    user.notifNum = notifNum;

    return user;
  }
}
