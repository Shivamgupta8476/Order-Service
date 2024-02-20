import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsArray, IsString, IsNumber, IsEnum, IsObject } from 'class-validator';

// Enum definitions
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

enum ShippingAddress {
  Home = 'home',
  Office = 'office',
  Other = 'other',
}

// Address class definition
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

// OrderDto class definition
export class OrderDto {  
  @ApiProperty({description: 'customerId'})
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({description: 'orderDate',default: new Date()})
  @IsNotEmpty()
  @IsString()
  orderDate: string; // Change to string type as Date might cause issues with serialization

  @ApiProperty({description: 'orderItems'})
  @IsNotEmpty()
  @IsArray() 
  orderItems: any[]; // You might want to define a proper type for order items

  @ApiProperty({description: 'totalPrice'})
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @ApiProperty({enum: ShippingAddress})
  @IsEnum(ShippingAddress)
  shippingAddress: ShippingAddress;

  @ApiProperty({type: Address})
  @IsObject()
  address: Address;

  @ApiProperty({enum: PaymentMethod})
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({enum: OrderStatus})
  @IsEnum(OrderStatus)
  orderStatus: OrderStatus;

  @ApiProperty({description: 'createdAt',default: new Date()})
  createdAt: Date;

  @ApiProperty({description: 'updatedAt',default: new Date()})
  updatedAt: Date;
}
