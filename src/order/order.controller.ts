import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';

import {
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { JwtAuthGuard } from 'src/middleware/jwt-auth.guard';
import { OrderService } from './order.service';
import { OrderDto } from './order.dto';

@ApiTags('Order')
@UseGuards(JwtAuthGuard)
@Controller('/order')
@ApiBearerAuth()
export class OrderController {
  @EventPattern('login_created')
  async handleOrderCreated(data: Record<string, unknown>) {
    console.log('login_created', data);
  }
  constructor(
    private service: OrderService,
    private readonly logger: Logger,
    @Inject('CUSTOMER_SERVICE') private readonly order2Customer: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly order2Order: ClientProxy,
  ) {}
  @Post('/create')
  @ApiOkResponse({ description: 'craeteorder ' }) 
  async createOrder( @Body() createOrder: OrderDto,@Req() req: Request): Promise<any> {
    this.logger.log('Request made to create Product');
    try {  

      const reqBody = req.body;

      console.log("createOrder======>",reqBody)
      this.order2Customer.emit('order_created', createOrder);
      this.order2Order.emit('order_created', createOrder);

      return await this.service.createOrder(reqBody);
    } catch (e) {
      this.logger.error(
        `Error occured while creating user :${JSON.stringify(e)}`,
      );
      throw new HttpException('Internal Server Error', 500);
    }
  }

  @Get('getOrder/:id')
  async getOrder(@Param('id') id: string) {
    try {
      let data = await this.service.getOrder(id);
      if (data) {
        return data;
      } else {
        throw new HttpException('Order not found', 404);
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  @Get('getAllOrders')
  async getAllOrder(req: Request) {
    try {
      let userId = req['user']['id'];
      let data = await this.service.getAllOrder(userId);
      if (data) {
        return data;
      } else {
        throw new HttpException('Product not found', 404);
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  @Delete('deleteOrder/:id')
  async deleteOrder(req: Request, @Param('id') id: string) {
    try {
      let userId = req['user']['id'];
      let data = await this.service.deleteOrder(id, userId);
      if (data) {
        return data;
      } else {
        throw new HttpException('Product not found', 404);
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  @Put('updateOrder/:id')
  async updateProduct(@Param('id') id: string, @Body() orderDto: OrderDto) {
    try { 
      let data = await this.service.updateOrder(id, orderDto);
      if (data) {
        return data;
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
}
