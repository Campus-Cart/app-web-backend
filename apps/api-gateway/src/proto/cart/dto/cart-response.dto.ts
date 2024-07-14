/* eslint-disable prettier/prettier */
export class CartItemResponseDto {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subTotalPrice: number;
}

export class CartResponseDto {
  id: string;
  userId: string;
  totalPrice: number;
  items: CartItemResponseDto[];
}
