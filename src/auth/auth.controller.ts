import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Req,
  Headers,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @RawHeaders() RawHeaders,
    @Headers() headers: IncomingHttpHeaders,
  ) {
    console.log({ headers });
    console.log({ user, RawHeaders });
    return {
      ok: true,
      message: 'test hola mundo jwt',
      user: {
        name: 'hector',
      },
    };
  }

  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateRoute2(@GetUser() user: User) {
    console.log({ user });
    return {
      ok: true,
      message: 'test hola mundo jwt2',
      user: {
        name: 'hector',
      },
    };
  }

  @Get('private3')
  @Auth(ValidRoles.superUser)
  testingPrivateRoute3(@GetUser() user: User) {
    console.log({ user });
    return {
      ok: true,
      message: 'test hola mundo jwt3',
      user: {
        name: 'hector',
      },
    };
  }
}
