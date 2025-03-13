/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto/login.dto';
import { AuthGuard } from './auth.guard';

import { ForgotPasswordDto } from './dto/forgot-password.dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto/reset-password.dto';
// import session from 'express-session';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface/authenticated-request.interface.interface';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { GoogleUserDto } from './dto/social-login.dto/social-login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

// First, add this interface at the top of your file
interface JwtPayload {
  id: string;
  email?: string;
  iat?: number;
  exp?: number;
}

// interface AuthenticatedRequest extends Request {
//   user?: any;
//   session?: session.Session & { user?: any };


// }
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService  // Add JwtService injection
  ) {}

  @Post('register')
  async register(@Body() registerDto:CreateAuthDto){ 
const result = await this.authService.register(registerDto);
if(!result){
  return {message:'Email already exists'};

  }
  return {message:result}

  }

  @Post('login')
  async login(@Body() loginDto:LoginDto , @Res({ passthrough: true }) res:Response){
   const tokens =  await this.authService.login(loginDto);
    // Set HttpOnly cookie for refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { 
      accessToken: tokens.accessToken , refreshToken: tokens.refreshToken };

  }

  @Post('refresh-token')
  refreshToken(@Req() req: Request, @Res() res: Response) {
    console.log('🟢 Incoming refresh request');
    console.log('📝 Cookies:', req.cookies);
  console.log('📝 Headers:', req.headers);
    const refreshToken: string | undefined = req.cookies?.refreshToken || 
      req.headers['authorization']?.split(' ')[1];
  
    if (!refreshToken) {
      console.error('❌ Refresh token is missing');
      throw new UnauthorizedException('Refresh token is missing');
    }
  
    try {
      const payload =  this.jwtService.verify<JwtPayload>(
        refreshToken,
        { secret: process.env.REFRESH_SECRET }
      );
      console.log('✅ Decoded Refresh Token:', payload);
  
      if (!payload?.id) {
        console.error('❌ Token does not contain a user ID');
        throw new UnauthorizedException('Invalid refresh token');
      }
  
      // Create a user object with the required id property
      const user = { id: payload.id } as User;
  
      // Generate a new access token with the user object
      const newAccessToken =  this.authService.generateToken(user);
      console.log('🟢 New Access Token Generated:', newAccessToken);
  
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
  
      return res.json({ accessToken: newAccessToken });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('❌ JWT Verification Error:', error.message);
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      throw new UnauthorizedException('An error occurred during token verification');
    }
  } 
   




  @Post('logout')
  async logout(@Req()req: AuthenticatedRequest, @Res() res: Response) {
    await this.authService.logout(req.user?.id);
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out successfully' });
  }
@Post('forget-password')
forgetPassword(@Body()forgetPassword:ForgotPasswordDto){
  return this.authService.forgetPassword(forgetPassword);
}
@Post('reset-password')
resetPassword(@Body()resetPassword:ResetPasswordDto){
  return this.authService.resetPassword(resetPassword);
}

@Get('google')
@UseGuards(GoogleAuthGuard)
// eslint-disable-next-line @typescript-eslint/require-await
async googleAuth() {
  return { message: 'Redirecting to Google login...' };
}

@Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleAuthRedirect(
  @Req() req: Request & { user: GoogleUserDto }, 
  @Res() res: Response
) {
  const data = await this.authService.googleLogin(req.user);
  if ('accessToken' in data) {
    res.cookie('accessToken', data.accessToken, { httpOnly: true, secure: true });
    return res.redirect(process.env.FRONTEND_URL ?? '/dashboard');
  }
  return res.status(400).json(data);
}

  // @Post('protected')
  // @UseGuards(AuthGuard)
  // async protectedRoute(@Req() req:{user:{email:string}}): Promise<{ message: string }> {
  //    return { message: `Welcome ${req.user.email}! This is a protected route.` };
  // }
  

  // Redirect user to Facebook login page


  @Post('protected')
  @UseGuards(AuthGuard)
  async protectedRoute(@Req() req: { user: { email: string } }): Promise<{ message: string }> {
    await Promise.resolve(); // This prevents the ESLint warning
    return { message: `Welcome ${req.user.email}! This is a protected route.` };
  }
  





  // @Get('facebook')
  // @UseGuards(new AuthGuard('facebook'))

  // facebookLogin(): void {
  //   // This triggers Facebook login via Passport.js
  // }

  // @Get('facebook/callback')
  // @UseGuards(new AuthGuard('facebook'))

  // facebookAuthCallback(@Req() req: AuthenticatedRequest, @Res() res: Response): void {

  //   if (!req.user) {
  //     return res.redirect('/login?error=unauthorized') as Response;
  //   }


  //   // Store user session
  //   if (req.session) {
  //     req.session.user = req.user;
  //   } else {
  //     req.session = { user: req.user }; // Initialize session if it doesn't exist
  //   }

  //   return res.redirect('/dashboard');
  // }


  @Get()  
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
