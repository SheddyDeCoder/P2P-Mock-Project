import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { HttpExceptionFilter } from './Exceptions/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://p2p-mock-project-frontend.onrender.com',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('P2p-Pay example')
    .setDescription('The P2p-Pay API description')
    .setVersion('1.0')
    .addTag('p2p-pay')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT-auth',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalFilters(new HttpExceptionFilter());

  // app.enableCors({
  //   origin: [
  //     'http://localhost:3000',
  //     'https://p2p-mock-project-frontend.onrender.com',
  //   ], // your Next.js port
  //   methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  //   credentials: true,
  // });

  await app.listen(process.env.PORT ?? 5005);
}
bootstrap();
