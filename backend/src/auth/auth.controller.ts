import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import type { LoginDto } from './dto/login.dto';
import type { RegistroDto } from './dto/registro.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('registro')
    @UseInterceptors(FileInterceptor('imagen'))
    registrar(@Body() dto: RegistroDto, @UploadedFile() imagen?: any) {
        return this.authService.registrar(dto, imagen);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}