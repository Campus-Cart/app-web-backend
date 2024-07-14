/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { MerchantModule } from './merchant/merchant.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentsModule } from './payments/payments.module';
import { PaystackModule } from './paystack/paystack.module';
import { HttpModule } from '@nestjs/axios';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

@Module({
  imports: [
    UsersModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      url: process.env.POSTGRES_URL,
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: ['dist/**/*.entity(.ts, .js)'],
      synchronize: true,
      autoLoadEntities: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    CartModule,
    OrderModule,
    MerchantModule,
    ReviewsModule,
    PaymentsModule,
    PaystackModule,
    HttpModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
