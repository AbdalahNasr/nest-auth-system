/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto/login.dto';
import { AuthGuard } from './auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto/reset-password.dto';
// import session from 'express-session';
// import { Response } from 'express';

// interface AuthenticatedRequest extends Request {
//   user?: any;
//   session?: session.Session & { user?: any };


// }
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto:CreateAuthDto){ 
const result = await this.authService.register(registerDto);
if(!result){
  return {message:'Email already exists'};

  }
  return {message:result}

  }
  @Post('login')
  async login(@Body() loginDto:LoginDto){
   return this.authService.login(loginDto);

  }

  // @Post('refresh-token')
  // async refreshToken(@Body() body:{userId:string, refreshToken:string}) { 
  //   return this.authService.refreshToken(body.userId, body.refreshToken);
  // }
  @Post('logout')
  async logout(@Body() body:{userId:string}) {
    return this.authService.logout(body.userId);
  }
@Post('forget-password')
forgetPassword(@Body()forgetPassword:ForgotPasswordDto){
  return this.authService.forgetPassword(forgetPassword);
}
@Post('reset-password')
resetPassword(@Body()resetPassword:ResetPasswordDto){
  return this.authService.resetPassword(resetPassword);
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
