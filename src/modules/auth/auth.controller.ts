import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  ValidationPipe,
  Res,
  UploadedFile,
  UseInterceptors,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { User } from '../../entities/user.entity';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { GetUser } from './get-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import $t from '@utils/message.util';
import { ChangeLocaleDto } from './dto/chagne-locale.dto';
import { Locale } from '@/enums/user-locale.enum';
import { ChangeNicknameDto } from './dto/chagne-nickname.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PasswordCheckPipe } from './pipe/password-check.pipe';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { KeyValueDto } from './dto/key-value.dto';
import { SentenceDto } from './dto/sentence.dto';
import { UserStampService } from '../user-stamp/user-stamp.service';
import { UserStamp } from '@/entities/user-stamp.entity';
import { loginResDto } from './dto/login-res.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userStampService: UserStampService,
  ) {}

  @ApiOperation({
    summary: '모든 유저 리스트 반환',
    description: `
      나와 친구를 맺지 않은 모든 유저 목록 반환
    `,
  })
  @ApiResponse({
    status: 200,
    description: '유저 목록 반환 성공',
    type: [User],
  })
  @ApiResponse({
    status: 500,
    description: '시스템 에러 발생',
  })
  @Get()
  @UseGuards(AuthGuard())
  getAllUsers(
    @GetUser() user: User,
    @Query('page') page: string,
    @Query('term') term: string,
  ): Promise<User[]> {
    return this.authService.getAllUsers(user, page, term);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  async me(@GetUser() user: User): Promise<loginResDto> {
    delete user.password;
    const userStamps = await this.userStampService.getAllUserStamps(user.id);
    return { user, userStamps };
  }

  @Get('/logout')
  @UseGuards(AuthGuard())
  logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'main',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });
  }

  @Get('/:id')
  getById(@Param('id') userId: string) {
    return this.authService.getById(userId);
  }

  @ApiOperation({
    summary: '회원가입',
    description: `
      회원가입을 처리하는 API입니다. 
      입력된 정보가 유효하면 새로운 유저가 생성됩니다.
    `,
  })
  @ApiBody({
    description: '회원가입에 필요한 정보',
    type: SignUpDto,
  })
  @ApiResponse({
    status: 201,
    description: '유저 생성 성공',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: '폼 에러 발생',
  })
  @ApiResponse({
    status: 500,
    description: '시스템 에러 발생',
  })
  @Post('/signup')
  async signUp(
    @Body(ValidationPipe, PasswordCheckPipe) signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<loginResDto> {
    const user = await this.authService.createUser(signUpDto, response);
    const userStamps = await this.userStampService.getAllUserStamps(user.id);
    return { user, userStamps };
  }

  @Post('/signin')
  async signIn(
    @Body(ValidationPipe) signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<loginResDto> {
    const user = await this.authService.signIn(signInDto, response);
    const userStamps = await this.userStampService.getAllUserStamps(user.id);
    return { user, userStamps };
  }

  @Post('/password')
  @UseGuards(AuthGuard())
  changePassword(
    @GetUser() user: User,
    @Body(ValidationPipe, PasswordCheckPipe)
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ user: User }> {
    return this.authService.changePassword(user, changePasswordDto);
  }

  @Post('/locale')
  @UseGuards(AuthGuard())
  changeLocale(
    @GetUser() user: User,
    @Body(ValidationPipe) changeLocaleDto: ChangeLocaleDto,
  ): Promise<{ locale: Locale }> {
    return this.authService.changeLocale(user, changeLocaleDto);
  }

  @Post('/nickname')
  @UseGuards(AuthGuard())
  changeNickname(
    @GetUser() user: User,
    @Body(ValidationPipe) changeNicknameDto: ChangeNicknameDto,
  ): Promise<{ nickname: string }> {
    return this.authService.changeNickname(user, changeNicknameDto);
  }

  @Post('/key-value')
  @UseGuards(AuthGuard())
  updateKeyValue(
    @GetUser() user: User,
    @Body(ValidationPipe) keyValueDto: KeyValueDto,
  ): Promise<void> {
    return this.authService.updateKeyValue(user, keyValueDto);
  }

  @Post('/sentence')
  @UseGuards(AuthGuard())
  updateSentence(
    @GetUser() user: User,
    @Body(ValidationPipe) sentenceDto: SentenceDto,
  ): Promise<void> {
    return this.authService.updateSentence(user, sentenceDto);
  }

  @Post('/upload-profile-photo')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('profile-photo'))
  uploadProfilePhoto(
    @GetUser() user: User,
    @UploadedFile() file: Express.MulterS3.File,
  ): Promise<{ filePath: string }> {
    if (!file) {
      throw new Error($t(user.locale).ProfilePhotoUploadFailed);
    }
    return this.authService.updatePhotoUrl(user, file.location);
  }

  @Post('/withdrawal')
  @UseGuards(AuthGuard())
  async withdrawal(
    @Body() withdrawalDto: WithdrawalDto,
    @Res({ passthrough: true }) response: Response,
    @GetUser() user: User,
  ): Promise<number> {
    const res = await this.authService.deleteUser(user, withdrawalDto);
    // 토큰 삭제
    if (res === 0) {
      response.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'main',
        sameSite: 'strict',
        expires: new Date(0),
        path: '/',
      });
    }
    return res;
  }

  @Patch('/delete-profile-photo')
  @UseGuards(AuthGuard())
  deleteProfilePhoto(@GetUser() user: User): Promise<void> {
    return this.authService.deletePhoto(user);
  }
}
