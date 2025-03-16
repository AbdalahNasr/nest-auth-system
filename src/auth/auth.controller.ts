/* eslint-disable prettier/prettier */
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Req, 
  UseGuards, 
  Res, 
  UnauthorizedException,
  ParseIntPipe 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto/login.dto';
import { AuthGuard } from './auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto/reset-password.dto';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { GoogleUserDto } from './dto/social-login.dto/social-login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @Post('register')
  async register(@Body() registerDto: CreateAuthDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<TokenResponse> {
    const result = await this.authService.login(loginDto);
    
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id!,
        email: result.user.email!,
        roles: result.user.roles!
      }
    };
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<TokenResponse> {
    const refreshToken = req.cookies?.refreshToken || 
      req.headers['authorization']?.toString().split(' ')[1];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken);
      const result = await this.authService.refreshToken(payload.sub, refreshToken);

      // Set new refresh token in cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user
      };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ): Promise<Response> {
    await this.authService.logout(req.user.id);
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out successfully' });
  }

  @Post('forget-password')
  async forgetPassword(
    @Body() forgetPasswordDto: ForgotPasswordDto
  ): Promise<{ message: string }> {
    await this.authService.forgetPassword(forgetPasswordDto);
    return { message: 'Password reset instructions sent to email' };
  }

  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(resetPasswordDto);
    return { message: 'Password successfully reset' };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/require-await
  async googleAuth(): Promise<{ message: string }> {
    return { message: 'Redirecting to Google login...' };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req: Request & { user: GoogleUserDto }, 
    @Res() res: Response
  ): Promise<Response> {
    const data = await this.authService.googleLogin(req.user);
    if ('accessToken' in data) {
      res.cookie('accessToken', data.accessToken, { httpOnly: true, secure: true });
      res.redirect(process.env.FRONTEND_URL ?? '/dashboard');
      return res;
    }
    return res.status(400).json(data);
  }

  @Get('protected')
  @UseGuards(AuthGuard)
  getProtected(@Req() req: AuthenticatedRequest): { message: string } {
    return { message: `Welcome ${req.user.email}!` };
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.authService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.authService.findOne(id);
  }

  @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.authService.remove(id);
  }
}
