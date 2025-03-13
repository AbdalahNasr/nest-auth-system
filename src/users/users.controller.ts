/* eslint-disable prettier/prettier */
import { 
    Controller, 
    Get, 
    Post, 
    Patch, 
    Param, 
    Delete, 
    UseGuards, 
    Req, 
    Body, 
    ParseUUIDPipe, 
    NotFoundException,
    InternalServerErrorException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async findAll(): Promise<User[]> {
        try {
            return await this.usersService.findAll();
        } catch (error) {
            console.error('Failed to fetch users:', error);
            throw new InternalServerErrorException('Failed to fetch users');
        }
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        try {
            const user = await this.usersService.findOne(id);
            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }
            return user;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to fetch user ${id}`);
        }
    }

    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
        try {
            const user = await this.usersService.findOne(id);
            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }
            await this.usersService.remove(id);
            return { message: 'User deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to delete user');
        }
    }

    @Get('profile')
    @UseGuards(AuthGuard)
    async getProfile(@Req() req: AuthenticatedRequest): Promise<User> {
        try {
            const user = await this.usersService.findOne(req.user.id);
            if (!user) {
                throw new NotFoundException('Profile not found');
            }
            return user;
        } catch (error: unknown) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Failed to fetch profile:', error);
            throw new InternalServerErrorException('Failed to fetch profile');
        }
    }

    @Patch('profile')
    @UseGuards(AuthGuard)
    async updateProfile(
        @Req() req: AuthenticatedRequest,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<User> {
        try {
            const updatedUser = await this.usersService.updateProfile(req.user.id, updateUserDto);
            if (!updatedUser) {
                throw new NotFoundException('Profile not found');
            }
            return updatedUser;
        } catch (error: unknown) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Failed to update profile:', error);
            throw new InternalServerErrorException('Failed to update profile');
        }
    }

    @Post('verify-email')
    @UseGuards(AuthGuard)
    async verifyEmail(@Req() req: AuthenticatedRequest): Promise<User> {
        try {
            const verifiedUser = await this.usersService.verifyEmail(req.user.id);
            if (!verifiedUser) {
                throw new NotFoundException('User not found');
            }
            return verifiedUser;
        } catch (error: unknown) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error('Failed to verify email:', error);
            throw new InternalServerErrorException('Failed to verify email');
        }
    }
}
