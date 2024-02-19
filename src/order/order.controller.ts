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
  
  import { ApiOkResponse, ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
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
      @Inject('PRODUCT_SERVICE') private readonly order2Order: ClientProxy
  
    ) { }
    @Post('/create')
    @ApiOkResponse({ description: 'craeteorder ' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async createProduct(
      @Body() createProductReq: OrderDto,
      @UploadedFile() file: Express.Multer.File,
      @Req() req: Request,
    ): Promise<any> {
      this.logger.log('Request made to create Product');
      try {
        console.log(file.originalname)
        if (!file.originalname.match(/\.(jpeg|jpg)$/)) {
          return new HttpException("Only image files are allowed!", 500)
        }
        this.order2Customer.emit('order_created', createProductReq);
        this.order2Order.emit('order_created', createProductReq);
        return await this.service.createProduct(createProductReq, file, req);
      } catch (e) {
        this.logger.error(
          `Error occured while creating user :${JSON.stringify(e)}`,
        );
        throw new HttpException('Internal Server Error', 500);
      }
    }
  
    @Get('getProducts/:id')
    async getProducts(@Param('id') id: string) {
      try {
        let data = await this.service.getProducts(id);
        if (data) {
          return data
        } else {
          throw new HttpException('Product not found', 404);
        }
      }
      catch (e) {
        throw new HttpException(e.message, 500);
      }
    }
  
    @Get('getAllProducts')
    async getAllProducts() {
      try {
        let data = await this.service.getAllProducts();
        if (data) {
          return data
        } else {
          throw new HttpException('Product not found', 404);
        }
      }
      catch (e) {
        throw new HttpException(e.message, 500);
      }
    }
  
  
    @Delete('deleteProducts/:id')
    async deleteProduct(req: Request, @Param('id') id: string) {
      try {
        let userId = req['user']['id'];
        let data = await this.service.deleteProduct(id, userId);
        if (data) {
          return data
        } else {
          throw new HttpException('Product not found', 404);
        }
      }
      catch (e) {
        throw new HttpException(e.message, 500);
      }
    }
  
    @Put('updateProducts/:id')
    async updateProduct(@Param('id') id: string, @Body() orderDto: OrderDto) {
      try {
        let data = await this.service.updateProduct(id, orderDto);
        if (data) {
          return data
        }
      }
      catch (e) {
        throw new HttpException(e.message, 500);
      }
  
    }
  
  
  
  }
  