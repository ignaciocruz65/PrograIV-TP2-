import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function iniciarServidor() {
  const servidor = await NestFactory.create<NestExpressApplication>(AppModule);
  
  servidor.enableCors({ origin: true });
  
  servidor.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  
  const puerto = process.env.PORT ?? 3000;
  await servidor.listen(puerto);
  
  console.log(`Servidor backend corriendo en: http://localhost:${puerto}`);
}

iniciarServidor();
