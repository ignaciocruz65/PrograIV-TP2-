import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    // importamos usuarios module para acceder a los servicios de usuarios y a las entidades de usuarios
    UsuariosModule,
    
    // importamos jwt module para acceder a jwt y a las entidades de jwt
    JwtModule.register({
      global: true, 
      secret: process.env.JWT_SECRET || 'clave_secreta_para_el_tp_2026', 
      signOptions: { expiresIn: '15m' },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}