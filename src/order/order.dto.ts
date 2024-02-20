import { ApiProperty } from '@nestjs/swagger';
import { bool } from 'aws-sdk/clients/signer';
import {
  IsNotEmpty,
  IsArray,
  IsString,
  IsNumber,
  IsEnum,
  IsObject,
} from 'class-validator';

// Define enums
enum PaymentMethod {
  COD = 'COD',
  Online = 'Online',
  Offline = 'Offline',
  Wallet = 'Wallet',
  Card = 'Card',
}

enum AddressType {
  Home = 'home',
  Office = 'office',
  Other = 'other',
}

// Address DTO
export class ShippingAddressDto {
  @ApiProperty({ description: 'State' })
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'City' })
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Pincode' })
  @IsNotEmpty()
  pincode: number;
}

// OrderDetails DTO
export class OrderDetails {
  @ApiProperty({ description: 'ProductId' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

// Order DTO
export class OrderDto {
  @ApiProperty({ description: 'Order items',type: [OrderDetails]})
  @IsNotEmpty()
  @IsArray()
  orderItems: OrderDetails[];

  @ApiProperty({ enum: AddressType, description: 'Address type' })
  @IsEnum(AddressType)
  addressType: AddressType;

  @ApiProperty({ type: ShippingAddressDto, description: 'Shipping address' })
  @IsObject()
  address: ShippingAddressDto;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Creation date', default: new Date() })
  createdAt: Date;

  @ApiProperty({ description: 'Update date', default: new Date() })
  updatedAt: Date;
}

export class OrderUpdateDto {
  @ApiProperty({ description: 'Order status', default: false })
  @IsObject()
  isCancelled: boolean;
}
