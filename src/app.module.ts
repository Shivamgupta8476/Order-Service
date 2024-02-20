import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OrderService } from './order/order.service';
import { OrderController } from './order/order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { JwtAuthGuard } from './middleware/jwt-auth.guard';
import {
  AuthenticationMiddleware,
} from './middleware/auth.service';
import { OrderModel, OrderSchema } from './order/order.schema';
import { ProductModel, ProductSchema } from './order/product.schema';
import { CustomerModel, CustomerSchema } from './order/customer.schema';
require('dotenv').config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([{ name: OrderModel.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: ProductModel.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: CustomerModel.name, schema: CustomerSchema },
    ]),
    ClientsModule.register([
      {
        name: 'CUSTOMER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_URI],
          queue: 'Customer_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_URI],
          queue: 'Product_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, Logger, JwtAuthGuard],
})
// export class AppModule{}
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).exclude().forRoutes('*');
  }
}
