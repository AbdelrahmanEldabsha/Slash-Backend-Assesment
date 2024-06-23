import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}
  async createOrder(userId: number, res: any) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    const cartItems = await this.prisma.cartItem.findMany({
      where: { cartId: cart.cartId },
      include: { product: true },
    });
    if (cartItems.length === 0) {
      throw new NotFoundException('Cart is empty');
    }
    const order = await this.prisma.order.create({
      data: {
        status: 'Pending',
        userId,
        discount: 0,
        totalPrice: cart.totalPrice,
      },
    });
    const orderItems = cartItems.map((item) => {
      return {
        orderId: order.orderId,
        productId: item.productId,
        quantity: item.quantity,
      };
    });

    await this.prisma.orderItem.createMany({
      data: orderItems,
    });

    //clear cart
    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.cartId,
      },
    });

    await this.prisma.cart.delete({
      where: {
        cartId: cart.cartId,
      },
    });
    //update stock
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      await this.prisma.product.update({
        where: { productId: item.productId },
        data: { stock: item.product.stock - item.quantity },
      });
    }
    //apply discount assigned by admin
    const orderResponse = await this.prisma.order.update({
      where: { orderId: order.orderId },
      data: { totalPrice: order.totalPrice - order.discount },
      include: { orderItems: true },
    });
    return res.status(200).json({ message: 'done', order: orderResponse });
  }
  async getOrderById(orderId: number, res: any) {
    const order = await this.prisma.order.findUnique({
      where: { orderId },
      include: { orderItems: { include: { product: true } } },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return res.status(200).json({ message: 'done', order });
  }
  async updateOrderStatus(
    orderId: number,
    updateOrderDto: UpdateOrderDto,
    res: any,
  ) {
    const { status } = updateOrderDto;
    const order = await this.prisma.order.update({
      where: { orderId },
      data: { status },
      include: { orderItems: { include: { product: true } } },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return res.status(200).json({ message: 'done', order });
  }
  async applyCoupon(body: ApplyCouponDto, res: any) {
    const { orderId, code } = body;
    const order = await this.prisma.order.findUnique({
      where: { orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const coupon = await this.prisma.coupon.findFirst({
      where: { code },
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { orderId },
      data: { discount: coupon.discount },
    });
    return res.status(200).json({ message: 'Discount added', updatedOrder });
  }
}
