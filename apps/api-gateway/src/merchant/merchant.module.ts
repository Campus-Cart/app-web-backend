/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from './entities/merchant.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Merchant]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '6h' },
    }),
  ],
  controllers: [MerchantController],
  providers: [MerchantService],
  exports: [MerchantService]
})
export class MerchantModule {}
