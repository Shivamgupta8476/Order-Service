import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OrderService } from './order/order.service';
import { OrderController } from './order/order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { JwtAuthGuard } from './middleware/jwt-auth.guard';
import { AuthenticationMiddleware, AuthorizationMiddleware } from './middleware/auth.service';
import { OrderModel, OrderSchema } from './order/order.schema';
require('dotenv').config();

@Module({
  imports: [
   MongooseModule.forRoot(process.env.MONGO_URI),
   MongooseModule.forFeature([{ name: OrderModel.name, schema: OrderSchema }]),
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
    secret:  process.env.SECRET_KEY,
    signOptions: { expiresIn: '1h' }, 
  })
  ],
  controllers: [OrderController],
  providers: [OrderService,Logger,JwtAuthGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude()
      .forRoutes('*');

      consumer
      .apply(AuthorizationMiddleware)
      .forRoutes(
        //{ path: 'order/deleteProducts/:id', method: RequestMethod.DELETE },
        );
  }
  
}
