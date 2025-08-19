import nodemailer from 'nodemailer';
import { LowStockProduct } from './types';

// Create a transporter. If email env vars are not set, use a JSON transport to avoid runtime errors in dev.
const hasEmailConfig = !!(
  process.env.EMAIL_SERVER_HOST &&
  process.env.EMAIL_SERVER_USER &&
  process.env.EMAIL_SERVER_PASSWORD
);

const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })
  : nodemailer.createTransport({ jsonTransport: true });

export async function sendLowStockAlert(products: LowStockProduct[]) {
  // If not configured, just log and return
  if (!hasEmailConfig || !process.env.EMAIL_FROM) {
    console.log('Email configuration not set up. Skipping notification.');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_SERVER_USER, // Owner's email
    subject: 'Low Stock Alert - Rich Auto Parts',
    html: `
      <h2>Low Stock Alert</h2>
      <p>The following products are running low on stock:</p>
      <ul>
        ${products
          .map(
            (product) =>
              `<li><strong>${product.productName}</strong> (${product.category}${product.type ? ' • ' + product.type : ''}): ${product.quantity} remaining (minimum: ${product.minimumStock})</li>`
          )
          .join('')}
      </ul>
      <p>Please restock these items as soon as possible.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Low stock alert email sent successfully');
  } catch (error) {
    console.error('Error sending low stock alert email:', error);
  }
}
