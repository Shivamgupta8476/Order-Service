import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsObject,
} from 'class-validator';

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

export class shippingAddressDto {
  @Prop({ required: true })
  @IsNotEmpty()
  state: string;

  @Prop({ required: true })
  @IsNotEmpty()
  city: string;

  @Prop({ required: true })
  @IsNotEmpty()
  pincode: number;
}

export class orderDetails {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  ProductId: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsNumber()
  price: number;
}

@Schema()
export class OrderModel {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsArray()
  orderItems: orderDetails[];

  @Prop({ required: true, default: true })
  @IsNotEmpty()
  isactive: boolean;

  @Prop({ required: true, default: Date.now })
  @IsNotEmpty()
  @IsString()
  orderDate: Date;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @Prop({ required: true })
  @IsEnum(AddressType)
  addressType: AddressType;

  @Prop({ required: true })
  @IsObject()
  address: shippingAddressDto;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(OrderModel);
