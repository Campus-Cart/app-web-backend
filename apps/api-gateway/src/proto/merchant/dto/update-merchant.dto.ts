/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateMerchantDto } from './create-merchant.dto';

export class UpdateMerchantDto extends PartialType(CreateMerchantDto) {
  name: string;
  email: string;
  businessName: string;
  businessDescription: string;
  password: string;
  phoneNumber: string;
}
