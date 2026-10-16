/**
 * Test Email Script
 * 
 * This script tests the email configuration by sending a test order confirmation email.
 * Run with: node test-email.js
 * 
 * It will:
 * 1. Load your .env configuration
 * 2. Connect to SMTP server
 * 3. Send a test order confirmation email
 * 4. Report success or show detailed error
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Test email address - CHANGE THIS to your email
const TEST_EMAIL = process.argv[2] || 'amroozcollection@gmail.com';

console.log('='.repeat(60));
console.log('📧 EMAIL CONFIGURATION TEST');
console.log('='.repeat(60));
console.log('\n📋 Configuration:');
console.log(`  Host:     ${process.env.MAIL_HOST}`);
console.log(`  Port:     ${process.env.MAIL_PORT}`);
console.log(`  Secure:   ${process.env.MAIL_SECURE}`);
console.log(`  User:     ${process.env.MAIL_USER}`);
console.log(`  From:     ${process.env.MAIL_FROM}`);
console.log(`  To:       ${TEST_EMAIL}`);
console.log('');

// Load Handlebars template
const templatePath = path.join(__dirname, 'src', 'mail', 'templates', 'order-confirmation.hbs');

let emailHtml;
try {
  const templateContent = fs.readFileSync(templatePath, 'utf-8');
  
  // Simple template variable replacement for testing
  const testData = {
    customerName: 'Test Customer',
    orderNumber: 'TEST' + Date.now(),
    items: [
      {
        name: 'Test Product 1',
        variant: 'Size: M, Color: Blue',
        qty: 2,
        unitPrice: '2,500',
        subtotal: '5,000'
      },
      {
        name: 'Test Product 2',
        variant: 'Size: L, Color: Red',
        qty: 1,
        unitPrice: '3,500',
        subtotal: '3,500'
      }
    ],
    subtotal: '8,500',
    shippingCost: '250',
    total: '8,750',
    currency: 'Rs',
    shippingAddress: {
      fullName: 'Test Customer',
      phone: '+92 300 1234567',
      street: '123 Test Street',
      apartment: 'Apt 4B',
      city: 'Karachi',
      postalCode: '75500',
      province: 'Sindh',
      country: 'Pakistan'
    },
    generatedPassword: 'TestPass123!',
    customerEmail: TEST_EMAIL
  };

  // Replace Handlebars variables (simple replacement for testing)
  emailHtml = templateContent
    .replace(/\{\{customerName\}\}/g, testData.customerName)
    .replace(/\{\{orderNumber\}\}/g, testData.orderNumber)
    .replace(/\{\{currency\}\}/g, testData.currency)
    .replace(/\{\{subtotal\}\}/g, testData.subtotal)
    .replace(/\{\{shippingCost\}\}/g, testData.shippingCost)
    .replace(/\{\{total\}\}/g, testData.total)
    .replace(/\{\{customerEmail\}\}/g, testData.customerEmail)
    .replace(/\{\{generatedPassword\}\}/g, testData.generatedPassword)
    .replace(/\{\{shippingAddress\.fullName\}\}/g, testData.shippingAddress.fullName)
    .replace(/\{\{shippingAddress\.phone\}\}/g, testData.shippingAddress.phone)
    .replace(/\{\{shippingAddress\.street\}\}/g, testData.shippingAddress.street)
    .replace(/\{\{shippingAddress\.apartment\}\}/g, testData.shippingAddress.apartment)
    .replace(/\{\{shippingAddress\.city\}\}/g, testData.shippingAddress.city)
    .replace(/\{\{shippingAddress\.postalCode\}\}/g, testData.shippingAddress.postalCode)
    .replace(/\{\{shippingAddress\.province\}\}/g, testData.shippingAddress.province)
    .replace(/\{\{shippingAddress\.country\}\}/g, testData.shippingAddress.country);

  // Handle the items loop (simple replacement)
  const itemsHtml = testData.items.map(item => `
    <tr>
      <td style="padding: 12px; font-size: 14px; color: #4a4a4a; border-bottom: 1px solid #f0f0f0;">${item.name}</td>
      <td style="padding: 12px; font-size: 13px; color: #6b5b4d; border-bottom: 1px solid #f0f0f0;">${item.variant}</td>
      <td style="padding: 12px; text-align: center; font-size: 14px; color: #4a4a4a; border-bottom: 1px solid #f0f0f0;">${item.qty}</td>
      <td style="padding: 12px; text-align: right; font-size: 14px; color: #4a4a4a; border-bottom: 1px solid #f0f0f0;">${testData.currency} ${item.unitPrice}</td>
      <td style="padding: 12px; text-align: right; font-size: 14px; font-weight: 600; color: #2c1810; border-bottom: 1px solid #f0f0f0;">${testData.currency} ${item.subtotal}</td>
    </tr>
  `).join('');
  
  emailHtml = emailHtml.replace(/\{\{#each items\}\}[\s\S]*?\{\{\/each\}\}/g, itemsHtml);
  
  // Handle conditional sections
  emailHtml = emailHtml.replace(/\{\{#if generatedPassword\}\}([\s\S]*?)\{\{else\}\}[\s\S]*?\{\{\/if\}\}/g, '$1');
  emailHtml = emailHtml.replace(/\{\{#if [^}]+\}\}/g, '').replace(/\{\{\/if\}\}/g, '');
  
  console.log('✅ Email template loaded successfully\n');
} catch (error) {
  console.error('❌ Error loading template:', error.message);
  console.log('   Template path:', templatePath);
  process.exit(1);
}

// Create transporter
console.log('🔌 Connecting to SMTP server...\n');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  debug: true, // Enable debug output
  logger: true  // Log to console
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Connection Failed!');
    console.log('');
    console.log('Error Details:');
    console.log('  Code:', error.code);
    console.log('  Message:', error.message);
    console.log('');
    console.log('Common Issues:');
    console.log('  • Wrong host (try smtp.hostinger.com instead of mail.amroozcollection.com)');
    console.log('  • Wrong port (try 587 instead of 465)');
    console.log('  • Wrong password');
    console.log('  • Email account not created in Hostinger');
    console.log('  • Firewall blocking outbound SMTP');
    console.log('');
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection Successful!');
    console.log('');
    console.log('📤 Sending test email...\n');
    
    // Send test email
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: TEST_EMAIL,
      subject: `Test Order Confirmation - #TEST${Date.now()}`,
      html: emailHtml
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('❌ Email Sending Failed!');
        console.log('');
        console.log('Error Details:');
        console.log('  Code:', error.code);
        console.log('  Message:', error.message);
        console.log('');
        process.exit(1);
      } else {
        console.log('✅ Email Sent Successfully!');
        console.log('');
        console.log('📧 Email Details:');
        console.log('  Message ID:', info.messageId);
        console.log('  Response:', info.response);
        console.log('');
        console.log('✅ CHECK YOUR INBOX!');
        console.log(`   Email sent to: ${TEST_EMAIL}`);
        console.log('   Check spam folder if not in inbox');
        console.log('');
        console.log('='.repeat(60));
        console.log('🎉 EMAIL TEST COMPLETED SUCCESSFULLY');
        console.log('='.repeat(60));
      }
    });
  }
});
