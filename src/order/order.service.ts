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
        @InjectModel(OrderModel.name) private readonly orderServiceModel: Model<OrderModel>,
    ) {
    }

    async createProduct(data: OrderDto, file: Express.Multer.File,req:any): Promise<any> {
        this.logger.log("Entered into createProduct", OrderService.name);
        try {
            if (!file || file.size <= 0) {
                return new HttpException("Invalid file", HttpStatus.BAD_REQUEST);
            }
            const newProduct = await this.orderServiceModel.create({...data,
                createdAt: data.createdAt || new Date(),
                updatedAt: data.updatedAt || new Date(),
                imageUrl: location ,
                adminId:req['user']['id']

            });
            return {
                message: 'Product created successfully',
                success: true,
                data: newProduct
            };
        } catch (error) {
            return error.message;
        }
    }

    async getProducts(id: string) {
        try{
        return await this.orderServiceModel.find({_id:id});
        }catch(e){
            throw new HttpException(e.message, 404);
        }

    }

    async getAllProducts() {
        try{
        return await this.orderServiceModel.find({});
        }catch(e){
            throw new HttpException(e.message, 404);
        }
    }

    async deleteProduct(id: string,userId:string) { 
        try{
        if(userId !== id){
            throw new HttpException('Unauthorized access', HttpStatus.FORBIDDEN);
        }
        return await this.orderServiceModel.findByIdAndDelete(id);
        }catch(e){
            throw new HttpException(e.message, 404);
        }
    }
    
    async updateProduct(id: string, data: OrderDto) {
        try { 
            const order = await this.orderServiceModel.findById(id);
            
            if (!order) {
                throw new Error("Product not found");
            } 
            order.stockQuantity += data.stockQuantity;
            order.updatedAt = new Date();
     
            await order.save();
            return order;
        } catch (error) {
            console.error("Error updating order:", error);
            throw error;
        }
    }
    
    
}
