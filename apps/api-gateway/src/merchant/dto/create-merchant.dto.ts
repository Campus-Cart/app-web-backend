/* eslint-disable prettier/prettier */
export class CreateMerchantDto {
  name: string;
  email: string;
  businessName: string;
  password: string;
  phoneNumber: string;
}

export class LoginMerchantDto {
  email: string;
  password: string;
}
