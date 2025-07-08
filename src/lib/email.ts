import nodemailer from 'nodemailer';

// Create transporter with detailed error logging
const createTransporter = () => {
  try {
    console.log('Attempting to create email transporter');
    console.log('SMTP Host:', process.env.SMTP_HOST);
    console.log('SMTP Port:', process.env.SMTP_PORT);
    console.log('SMTP User:', process.env.SMTP_USER ? process.env.SMTP_USER.replace(/./g, '*') : 'Not set');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Add connection timeout and debug logging
      connectionTimeout: 10000,
      debug: true,
    });

    // Verify transporter connection
    transporter.verify((error, success) => {
      if (error) {
        console.error('Email Transporter Verification Failed:', error);
      } else {
        console.log('Email Transporter is ready to send messages');
      }
    });

    return transporter;
  } catch (setupError) {
    console.error('Failed to set up email transporter:', setupError);
    throw setupError;
  }
};

// Lazy initialization of transporter
let transporter: nodemailer.Transporter | null = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

export interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  orderTotal: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: string;
  orderStatus: string;
}

// Order confirmation email
export async function sendOrderConfirmation(data: OrderEmailData) {
  const { orderId, customerName, customerEmail, orderTotal, orderItems, shippingAddress } = data;

  const itemsHtml = orderItems
    .map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} EGP</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${(item.quantity * item.price).toFixed(2)} EGP</td>
      </tr>
    `)
    .join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - WonderWorks</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">WonderWorks</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Order Confirmation</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Thank you for your order!</h2>
        
        <p>Dear ${customerName},</p>
        
        <p>We've received your order and it's being processed. Here are the details:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Order Information</h3>
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ${orderTotal.toFixed(2)} EGP</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #333;">Shipping Address</h3>
          <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
            ${shippingAddress}
          </p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #333;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #ddd;">Total:</td>
                <td style="padding: 12px; text-align: right; border-top: 2px solid #ddd;">${orderTotal.toFixed(2)} EGP</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="margin-top: 0; color: #155724;">What's Next?</h3>
          <p style="margin-bottom: 10px;">We'll send you updates as your order progresses:</p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Order confirmation (this email)</li>
            <li>Payment confirmation</li>
            <li>Order processing notification</li>
            <li>Shipping confirmation with tracking</li>
            <li>Delivery confirmation</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL}/orders/${orderId}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
            View Order Details
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
          <p>If you have any questions, please contact our support team.</p>
          <p>Thank you for choosing WonderWorks!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"WonderWorks" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Order Confirmation #${orderId} - WonderWorks`,
      html: emailHtml,
    });
    
    console.log(`Order confirmation email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
}

// Order status update email
export async function sendOrderStatusUpdate(data: OrderEmailData) {
  const { orderId, customerName, customerEmail, orderStatus } = data;

  const statusMessages = {
    'PROCESSING': 'Your order is now being processed and prepared for shipping.',
    'SHIPPED': 'Your order has been shipped! You can track your package using the tracking number provided.',
    'DELIVERED': 'Your order has been delivered! We hope you enjoy your purchase.',
    'CANCELLED': 'Your order has been cancelled. If you have any questions, please contact our support team.',
  };

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update - WonderWorks</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">WonderWorks</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Order Status Update</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Order Status Update</h2>
        
        <p>Dear ${customerName},</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Order #${orderId}</h3>
          <p><strong>New Status:</strong> <span style="color: #667eea; font-weight: bold;">${orderStatus}</span></p>
          <p>${statusMessages[orderStatus as keyof typeof statusMessages] || 'Your order status has been updated.'}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL}/orders/${orderId}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
            View Order Details
          </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
          <p>Thank you for choosing WonderWorks!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"WonderWorks" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Order #${orderId} Status Update - ${orderStatus}`,
      html: emailHtml,
    });
    
    console.log(`Order status update email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Failed to send order status update email:', error);
  }
}

// ------------------------------------------------------------------
// Email verification
// ------------------------------------------------------------------

interface VerificationEmailData {
  userName: string;
  userEmail: string;
  token: string;
}

export async function sendVerificationEmail(data: VerificationEmailData) {
  try {
    // Validate required environment variables
    if (!process.env.SMTP_HOST) {
      throw new Error('SMTP_HOST is not configured');
    }
    if (!process.env.SMTP_USER) {
      throw new Error('SMTP_USER is not configured');
    }
    if (!process.env.SMTP_PASS) {
      throw new Error('SMTP_PASS is not configured');
    }

    const { userName, userEmail, token } = data;
    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify/${token}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verify your email - WonderWorks</title>
      </head>
      <body>
        <h1>Verify Your Email</h1>
        <p>Hi ${userName},</p>
        <p>Click the link to verify your email:</p>
        <a href="${verifyUrl}">Verify Email</a>
      </body>
      </html>
    `;

    console.log(`Attempting to send verification email to ${userEmail}`);

    const mailOptions = {
      from: `"WonderWorks" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Verify your email - WonderWorks',
      html: emailHtml,
    };

    // Send email with comprehensive error handling
    const transporterInstance = getTransporter();
    const info = await transporterInstance.sendMail(mailOptions);
    
    console.log('Verification email sent successfully:', info);
    return info;
  } catch (error) {
    console.error('Comprehensive Email Sending Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      emailData: { 
        to: data.userEmail, 
        userName: data.userName 
      },
      envConfig: {
        SMTP_HOST: process.env.SMTP_HOST ? 'Configured' : 'Not set',
        SMTP_USER: process.env.SMTP_USER ? 'Configured' : 'Not set',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL
      }
    });
    
    throw error;
  }
}

// ------------------------------------------------------------------
// Password reset email
// ------------------------------------------------------------------

interface PasswordResetEmailData {
  userName: string;
  userEmail: string;
  token: string;
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData) {
  const { userName, userEmail, token } = data;
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset - WonderWorks</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">WonderWorks</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Reset your password</p>
      </div>
      <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you didn't request a password reset, you can ignore this email.</p>
        <p>If the button doesn't work, copy and paste the link below into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>Thank you!</p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"WonderWorks" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Reset your password - WonderWorks',
      html: emailHtml,
    });
    console.log(`Password reset email sent to ${userEmail}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
} 