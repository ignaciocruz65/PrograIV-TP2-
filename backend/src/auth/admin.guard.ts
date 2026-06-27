import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException('No hay token');

    try {
        request['usuario'] = await this.jwtService.verifyAsync(token);
    } catch {
        throw new UnauthorizedException('Token inválido o vencido');
    }

    if (request['usuario'].perfil !== 'administrador') {
        throw new UnauthorizedException('Acceso denegado. Solo para administradores.');
    }

    return true;
    } 
}