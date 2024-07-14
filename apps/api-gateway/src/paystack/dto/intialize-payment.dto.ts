/* eslint-disable prettier/prettier */
export class InitializePaymentDto {
  email: string;
  amount: number;
}

export class VerifyPaymentDto {
  reference: string;
}
