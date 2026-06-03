import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    // 1. ConfigModule lee el archivo .env apenas arranca la app
    ConfigModule.forRoot({ isGlobal: true }), 
    
    // 2. Le pasamos directamente la variable de entorno a Mongoose
    MongooseModule.forRoot(process.env.MONGO_URL!), 
    
    AuthModule, 
    PublicacionesModule, 
    UsuariosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}