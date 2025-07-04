import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderStatusUpdate } from '@/lib/email';

// Define proper types for order items
interface OrderItemWithProduct {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

interface OrderWithItems {
  id: number;
  userId: number;
  total: number;
  status: string;
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
  items: OrderItemWithProduct[];
}

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2025-05-28.basil' }) : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe!.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { orderId } = paymentIntent.metadata;
  
  if (!orderId) {
    console.error('No order ID in payment intent metadata');
    return;
  }

  try {
    const order = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { 
        status: 'PROCESSING',
      },
      include: {
        user: true,
        items: {
          include: { product: true }
        }
      }
    }) as OrderWithItems;

    console.log(`Order ${orderId} payment confirmed`);

    // Send status update email
    if (order.user) {
      await sendOrderStatusUpdate({
        orderId: order.id,
        customerName: order.user.name || 'Customer',
        customerEmail: order.user.email,
        orderTotal: order.total,
        orderItems: order.items.map((item: OrderItemWithProduct) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: 'Address from order', // You might want to store this in the order
        orderStatus: order.status,
      });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { orderId } = paymentIntent.metadata;
  
  if (!orderId) {
    console.error('No order ID in payment intent metadata');
    return;
  }

  try {
    const order = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: 'CANCELLED' },
      include: {
        user: true,
        items: {
          include: { product: true }
        }
      }
    }) as OrderWithItems;

    console.log(`Order ${orderId} payment failed`);

    // Send status update email
    if (order.user) {
      await sendOrderStatusUpdate({
        orderId: order.id,
        customerName: order.user.name || 'Customer',
        customerEmail: order.user.email,
        orderTotal: order.total,
        orderItems: order.items.map((item: OrderItemWithProduct) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: 'Address from order',
        orderStatus: order.status,
      });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
  }
} 