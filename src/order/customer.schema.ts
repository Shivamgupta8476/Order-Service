import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class Address {
  @Prop({ required: true })
  @ApiProperty()
  @IsNotEmpty()
  state: string;

  @Prop({ required: true })
  @ApiProperty()
  @IsNotEmpty()
  city: string;

  @Prop({ required: true })
  @ApiProperty()
  @IsNotEmpty()
  pincode: number;
}

@Schema()
export class CustomerModel {
  @Prop({ required: true })
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @Prop({ required: true })
  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @Prop({ required: true })
  @ApiProperty()
  @IsNotEmpty()
  customer_id: string;

  @Prop({ required: true })
  @ApiProperty()
  @IsNotEmpty()
  role: string;

  @Prop({
    required: true,
    unique: true,
  })
  @ApiProperty()
  @IsNotEmpty()
  phoneNo: string;

  @Prop({
    required: true,
    unique: true,
  })
  @ApiProperty()
  @IsNotEmpty()
  emailId: string;

  @Prop({ required: true })
  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @Prop({
    type: [Address],
    required: true,
  })
  @ApiProperty({ type: [Address] })
  @IsNotEmpty()
  billingAddress: Array<Address>;

  @Prop({
    type: [Address],
    required: true,
  })
  @ApiProperty({ type: [Address] })
  @IsNotEmpty()
  shippingAddress: Array<Address>;

  @Prop({ default: Date.now })
  @ApiProperty({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  @ApiProperty({ default: Date.now })
  updatedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(CustomerModel);
