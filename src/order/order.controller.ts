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
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { ApiOkResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { JwtAuthGuard } from 'src/middleware/jwt-auth.guard';
import { OrderService } from './order.service';
import { OrderDto, OrderUpdateDto } from './order.dto';

@ApiTags('Order')
@Controller('/order')
@ApiBearerAuth()
export class OrderController {
  constructor(
    private service: OrderService,
    private readonly logger: Logger,
    @Inject('CUSTOMER_SERVICE') private readonly order2Customer: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly order2Product: ClientProxy,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  @ApiOkResponse({ description: 'craeteorder ' })
  async createOrder(
    @Body() createOrder: OrderDto,
    @Req() req: Request,
  ): Promise<any> {
    this.logger.log('Request made to create Product');
    try {
      return await this.service.createOrder(createOrder, req);
    } catch (e) {
      this.logger.error(
        `Error occured while creating user :${JSON.stringify(e)}`,
      );
      throw new HttpException('Internal Server Error', 500);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get('getOrder/:id')
  async getOrder(@Param('id') id: string, @Req() req: Request) {
    try {
      let data = await this.service.getOrder(id, req);
      if (data) {
        return data;
      } else {
        throw new HttpException('Order not found', 404);
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get('getAllOrders')
  async getAllOrder(@Req() req: Request) {
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
  @UseGuards(JwtAuthGuard)
  @Delete('deleteOrder/:id')
  async deleteOrder(@Req() req: Request, @Param('id') id: string) {
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
  @UseGuards(JwtAuthGuard)
  @Put('updateOrder/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() orderDto: OrderUpdateDto,
  ) {
    try {
      let data = await this.service.updateOrder(id, orderDto);
      if (data) {
        return data;
      }
    } catch (e) {
      throw new HttpException(e.message, 500);
    }
  }

  @EventPattern('create_customer')
  async handledCustomerCreate(data: any) {
    await this.service.handledCustomerCreate(data);
  }

  @EventPattern('update_customer')
  async handledCustomerUpdate(data: any) {
    await this.service.handledCustomerUpdate(data);
  }

  @EventPattern('delete_customer')
  async handledCustomerDelete(data: any) {
    await this.service.handledCustomerDelete(data);
  }

  @EventPattern('Product_created')
  async handledProductCreated(data: any) {
    await this.service.handledProductCreated(data);
  }

  @EventPattern('Product_deleted')
  async handledProductDeleted(data: any) {
    await this.service.handledProductDeleted(data);
  }

  @EventPattern('Product_updated')
  async handledProductUpdatede(data: any) {
    await this.service.handledProductUpdatede(data);
  }
}
