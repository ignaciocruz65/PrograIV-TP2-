import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function iniciarServidor() {
  // creamos server 
  const servidor = await NestFactory.create(AppModule);
  
  // cors para que angular pueda conectarse al servidor
  servidor.enableCors({ origin: true });
  
  const puerto = process.env.PORT ?? 3000;
  await servidor.listen(puerto);
  
  console.log(`Servidor backend corriendo en: http://localhost:${puerto}`);
}

iniciarServidor();