import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
  process.exit(1); // Exit the process with a failure code
});
