import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get('ConfigService');
  const port = config.port || 3000;
  await app.listen(port);
  console.log(`Subscription service running on port ${port}`);
}
bootstrap();
