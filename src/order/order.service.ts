import { HttpException, HttpStatus, Injectable, Logger, Req } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import  { Model,Types } from 'mongoose';
import { ApiBearerAuth } from '@nestjs/swagger';
import * as AWS from 'aws-sdk';
import { ClientProxy} from '@nestjs/microservices';
import { OrderModel } from './order.schema';
import { OrderDto } from './order.dto';
require('dotenv').config();


@Injectable()
@ApiBearerAuth()
export class OrderService {
    constructor(
        private readonly logger: Logger,
        @InjectModel("OrderModel") private readonly orderServiceModel: Model<OrderModel>,
    ) {
    }

    async createOrder(data: OrderDto): Promise<any> {
        // this.logger.log("Entered into createProduct", OrderService.name);
        try { 
            if(!data.customerId){
                throw new HttpException('customerId is required', 404);
            }

            let orderdata = {}
            orderdata['customerId'] = data.customerId
            orderdata['totalPrice'] = data.totalPrice
            orderdata['paymentMethod'] = data.paymentMethod
            orderdata['shippingAddress'] = data.shippingAddress
            orderdata['orderItems'] = data.orderItems
            orderdata['orderStatus'] = data.orderStatus
            orderdata['address'] = data.address
            orderdata['orderDate'] = data.orderDate
            orderdata['createdAt'] = data.createdAt
            orderdata['updatedAt'] = data.updatedAt


            const newOrder = await this.orderServiceModel.create({orderdata}); 
            return newOrder
        } catch (e) {
            throw new HttpException(e.message, 404);
        }
    }
    
    
    async getOrder(id: string) {
        try{
        return await this.orderServiceModel.find({_id:id});
        }catch(e){
            throw new HttpException(e.message, 404);
        }

    }

    async getAllOrder(userId:string) {
        try{
        return await this.orderServiceModel.find({customerId:userId});
        }catch(e){
            throw new HttpException(e.message, 404);
        }
    }

    async deleteOrder(id: string,userId:string) { 
        try{
        if(userId !== id){
            throw new HttpException('Unauthorized access', HttpStatus.FORBIDDEN);
        }
        return await this.orderServiceModel.findByIdAndDelete(id);
        }catch(e){
            throw new HttpException(e.message, 404);
        }
    }
    
    async updateOrder(id: string, data: OrderDto) {
        try { 
            const order = await this.orderServiceModel.findById(id);
            
            if (!order) {
                throw new Error("Product not found");
            }  
            order.updatedAt = new Date();
     
            await order.save();
            return order;
        } catch (error) {
            console.error("Error updating order:", error);
            throw error;
        }
    }
    
    
}
