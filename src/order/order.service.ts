import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OrderModel } from './order.schema';
import { OrderDto, OrderUpdateDto } from './order.dto';
import { ProductModel } from './product.schema';
import { CustomerModel } from './customer.schema';
import { ClientProxy } from '@nestjs/microservices';
require('dotenv').config();

@Injectable()
@ApiBearerAuth()
export class OrderService {
  constructor(
    private readonly logger: Logger,
    @InjectModel('OrderModel')
    private readonly orderServiceModel: Model<OrderModel>,
    @InjectModel('ProductModel')
    private readonly productServiceModel: Model<ProductModel>,
    @InjectModel('CustomerModel')
    private readonly customerServiceModel: Model<CustomerModel>,
    @Inject('CUSTOMER_SERVICE') private readonly order2Customer: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly order2Product: ClientProxy,
  ) {}

  async createOrder(data: OrderDto, req: any): Promise<any> {
    this.logger.log('Entered into createProduct', OrderService.name);

    try {
      let orderobj = {
        customerId: req['user']['id'],
        orderItems: [],
        orderDate: new Date(),
        totalPrice: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isactive: true,
      };
      const userData = await this.customerServiceModel
        .findOne({ customer_id: req['user']['id'] })
        .exec();
      if (!userData) {
        return new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      let productIDs = data.orderItems.map((orderdata) => orderdata.productId);
      const checkProductExist = await this.productServiceModel.find({
        productId: { $in: productIDs },
        isactive: true,
      });

      if (checkProductExist.length !== productIDs.length) {
        return new HttpException('One or more products not found', HttpStatus.NOT_FOUND);
      }

      for (const [index, orderdata] of data.orderItems.entries()) {
        const matchingProduct = checkProductExist.find(
          (product) => product.productId === orderdata.productId,
        );
        if (
          !matchingProduct ||
          orderdata.quantity > matchingProduct.stockQuantity
        ) {
          return new HttpException(`Insufficient stock for product "${matchingProduct.name}" (ID: ${orderdata.productId}). Available quantity: ${matchingProduct.stockQuantity}`, HttpStatus.BAD_REQUEST);

        } else {
          matchingProduct.stockQuantity -= orderdata.quantity;
          orderdata['price'] = matchingProduct.price;
          orderobj.totalPrice += matchingProduct.price * orderdata.quantity;
          orderobj.orderItems.push({ ...orderdata });
          this.order2Product.emit('update_Product_stock', matchingProduct);
          await matchingProduct.save();
        }
      }

      orderobj['paymentMethod'] = data?.paymentMethod;
      orderobj['addressType'] = data?.addressType;
      if (
        !data?.address?.city &&
        !data?.address?.pincode &&
        !data?.address?.state
      ) {
        orderobj['address'] = userData?.shippingAddress?.[0];
      } else {
        orderobj['address'] = data?.address;
      }
      const newOrder = await this.orderServiceModel.create(orderobj);
      return {
        status: true,
        message: 'Order Created Successfully',
        data: newOrder,
      };
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }

  async getOrder(id: string, req: any) {
    try {
      this.logger.log('Entered into getOrderData', OrderService.name);
      const findOrderDetails = await this.orderServiceModel.findOne({
        _id: id,
        isactive: true,
      });
      if (!findOrderDetails) {
        return new HttpException(
          'Order Details not found',
          HttpStatus.NOT_FOUND,
        );
      }
      if (req.user.id != findOrderDetails.customerId) {
        throw new UnauthorizedException(
          'You are not authorised to access this data',
        );
      }
      return {
        status: true,
        message: 'Order Details  Fetched Successfully',
        data: findOrderDetails,
      };
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }

  async getAllOrder(userId: any) {
    try {
      this.logger.log('Entered into getallOrderData', OrderService.name);
      const findOrderDetails = await this.orderServiceModel.find({
        customerId: userId,
        isactive: true,
      });
      if (findOrderDetails.length==0) {
        return new HttpException(
          'Order Details not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        status: true,
        message: 'Order Details Fetched Successfully',
        data: findOrderDetails,
      };
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }

  async deleteOrder(id: string, userId: string) {
    try {
      const findOrderDetails = await this.orderServiceModel.findOne({
        _id: id,
        isactive: true,
      });
      if (!findOrderDetails) {
        return new HttpException(
          'Order Details not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (userId !== findOrderDetails.customerId) {
        throw new HttpException('Unauthorized access', HttpStatus.FORBIDDEN);
      }
      findOrderDetails.isactive = false;
      for (const item of findOrderDetails.orderItems) {
        this.order2Product.emit('delete_order', item);
        await this.productServiceModel
          .findOneAndUpdate(
            { productId: item['productId']},
            { $inc: { stockQuantity: item.quantity } },
          )
          .exec();
      }

      return await this.orderServiceModel
        .findByIdAndUpdate({ _id: id }, findOrderDetails, { new: true })
        .exec();
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }

  async updateOrder(id: string, data: OrderUpdateDto) {
    try {
      const order = await this.orderServiceModel.findOne({
        _id: id,
        isactive: true,
      });

      if (!order) {
        return new HttpException(
          'Order Details not found',
          HttpStatus.NOT_FOUND,
        );
      }

      order.updatedAt = new Date();
      if (data?.isCancelled == true) {
        order.isactive = false;
      }
      for (const item of order.orderItems) {
        this.order2Product.emit('Cancel_order', item);
        await this.productServiceModel
          .findOneAndUpdate(
            { productId: item['productId']},
            { $inc: { stockQuantity: item.quantity } },
          )
          .exec();
      }
      let orderdata = await this.orderServiceModel
        .findByIdAndUpdate({ _id: id }, order, { new: true })
        .exec();
      return {
        message: 'success cancelled order',
        data: orderdata,
      };
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  async handledCustomerCreate(data: any) {
    try {
      return await this.customerServiceModel.create(data);
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }

  async handledCustomerUpdate(data: any) {
    try {
      const findCustomerDetails = await this.customerServiceModel
        .findOne({
          customer_id: data._id,
        })
        .exec();

      if (!findCustomerDetails) {
        return new HttpException(
          'Customer Details not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Update customer details based on the provided data
      if (data?.firstName) {
        findCustomerDetails.firstName = data.firstName;
      }
      if (data?.lastName) {
        findCustomerDetails.lastName = data.lastName;
      }
      if (data?.phoneNo) {
        findCustomerDetails.phoneNo = data.phoneNo;
      }
      if (data?.emailId) {
        findCustomerDetails.emailId = data.emailId;
      }
      if (data?.password) {
        findCustomerDetails.password = data?.password;
      }

      // Check if billingAddress exists in the data object before accessing its properties
      if (data?.billingAddress?.[0]?.state) {
        findCustomerDetails.billingAddress[0].state =
          data.billingAddress[0].state;
      }
      if (data?.billingAddress?.[0]?.city) {
        findCustomerDetails.billingAddress[0].city =
          data.billingAddress[0].city;
      }
      if (data?.billingAddress?.[0]?.pincode) {
        findCustomerDetails.billingAddress[0].pincode =
          data.billingAddress[0].pincode;
      }

      // Check if shippingAddress exists in the data object before accessing its properties
      if (data?.shippingAddress?.[0]?.state) {
        findCustomerDetails.shippingAddress[0].state =
          data.shippingAddress[0].state;
      }
      if (data?.shippingAddress?.[0]?.city) {
        findCustomerDetails.shippingAddress[0].city =
          data.shippingAddress[0].city;
      }
      if (data?.shippingAddress?.[0]?.pincode) {
        findCustomerDetails.shippingAddress[0].pincode =
          data.shippingAddress[0].pincode;
      }
      delete data._id;
      const updateCustomer = await this.customerServiceModel
        .findByIdAndUpdate(
          { _id: findCustomerDetails._id },
          findCustomerDetails,
          { new: true },
        )
        .exec();
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }

  async handledCustomerDelete(data: any) {
    try {
      await this.customerServiceModel.deleteOne({ customer_id: data }).exec();
      await this.productServiceModel.deleteMany({ adminId: {$in:[data]} }).exec();
      await this.orderServiceModel.updateMany(
        { customerId: { $in: [data] } },
        { isactive: false },
        { new: true },
      );
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }

  async handledProductCreated(data: any) {
    try {
      return await this.productServiceModel.create(data);
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }

  async handledProductDeleted(data: any) {
    try {
      await this.productServiceModel.deleteOne({ productId: data }).exec();
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }
  async handledProductUpdatede(data: any) {
    try {
      const findproduct = await this.productServiceModel
        .findOne({ productId: data.productId })
        .exec();

      if (!findproduct) {
        throw new Error('Product not found');
      }
      if (data?.name) {
        findproduct.name = data.name;
      }
      if (data?.description) {
        findproduct.description = data.description;
      }
      if (data?.isactive) {
        findproduct.isactive = data.isactive;
      }
      if (data?.brand) {
        findproduct.brand = data.brand;
      }
      if (data?.price) {
        findproduct.price = data.price;
      }
      if (data?.stockQuantity) {
        findproduct.stockQuantity = data.stockQuantity;
      }
      if (data?.availability && ['yes', 'no'].includes(data.availability)) {
        findproduct.availability = data.availability;
      }
      delete data._id;
      findproduct.updatedAt = new Date();

      await this.productServiceModel
        .findByIdAndUpdate({ _id: findproduct._id }, findproduct, { new: true })
        .exec();
      return findproduct;
    } catch (e) {
      throw new HttpException(e.message, 404);
    }
  }
}
