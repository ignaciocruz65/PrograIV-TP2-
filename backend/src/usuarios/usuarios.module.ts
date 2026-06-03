import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { Usuario, UsuarioSchema } from './usuario.shema';

@Module({
  // connectamos el esquema de usuario y mongoose a este modulo para que se pueda usar en otros modulos
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }])
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService] 
})
export class UsuariosModule {}