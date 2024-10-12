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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PasswordCheckPipe } from './pipe/password-check.pipe';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { KeyValueDto } from './dto/key-value.dto';
import { SentenceDto } from './dto/sentence.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: '',
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

  @Post('/signup')
  signUp(
    @Body(ValidationPipe, PasswordCheckPipe) signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: User }> {
    return this.authService.createUser(signUpDto, response);
  }

  @Post('/signin')
  signIn(
    @Body(ValidationPipe) signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ user: User }> {
    return this.authService.signIn(signInDto, response);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  me(@GetUser() user: User) {
    delete user.password;
    return { user };
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

  @Patch('/delete-profile-photo')
  @UseGuards(AuthGuard())
  deleteProfilePhoto(@GetUser() user: User): Promise<void> {
    return this.authService.deletePhoto(user);
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
}
