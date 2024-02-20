import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsUrl,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { types } from 'util';

enum OrderStatus {
  Pending = 'Pending',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

enum PaymentMethod {
  COD = 'COD',
  Online = 'Online',
  Offline = 'Offline',
  Wallet = 'Wallet',
  Card = 'Card',
}

enum OrderType {
  Normal = 'Normal',
  Return = 'Return',
  Exchange = 'Exchange',
}

enum shippingAddress {
  Home = 'Address',
  Office = 'Address',
  Other = 'Address',
}

export class Address {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    street: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    city: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    state: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    country: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    pincode: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    landmark: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    types: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    contact: number;
  }
  
@Schema()
export class OrderModel {
  @ApiProperty({ description: 'customerId', required: true })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({ description: 'orderDate', required: true })
  @IsNotEmpty()
  @IsString()
  orderDate: Date;

  @ApiProperty({ description: 'orderItems', required: true })
  @IsNotEmpty()
  @IsArray()
  orderItems: [];

  @ApiProperty({ description: 'totalPrice', required: true })
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @ApiProperty({ description: 'paymentMethod', required: true })
  @IsNotEmpty()
  @IsString()
  paymentMethod: PaymentMethod;
 
  @ApiProperty({ enum: shippingAddress, enumName: 'ShippingAddress' })
  shippingAddress: shippingAddress;

  @ApiProperty({ enum: Address, enumName: 'Address' })
  @IsEnum(Address)
  address:Address

@ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
@IsEnum(OrderStatus)
orderStatus: OrderStatus;

  @ApiProperty({
    description: 'createdAt',
    required: false,
    default: new Date(),
  })
  createdAt: Date;

  @ApiProperty({
    description: 'updatedAt',
    required: false,
    default: new Date(),
  })
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(OrderModel);
