const User = require("./user.model");
const Customer = require("./customer.model");
const Category = require("./category.model");
const Product = require("./product.model");
const Order = require("./order.model");
const OrderItem = require("./orderItem.model");
const Notification = require("./notification.model");
const Quote = require("./quote.model");
const QuoteItem = require("./quoteItem.model");
const PaymentMethod = require("./paymentMethod.model");
const Payment = require("./payment.model");
const PaymentTransaction = require("./paymentTransaction.model");
const Invoice = require("./invoice.model");
const InvoiceItem = require("./invoiceItem.model");
const Company = require("./company.model");
const NcfSequence = require("./ncfSequence.model");
const CreditDebitNote = require("./creditDebitNote.model");

// Relaciones existentes
User.hasMany(Customer, { foreignKey: "user_id" });
Customer.belongsTo(User, { foreignKey: "user_id" });

// Relaciones de productos
Category.hasMany(Product, { foreignKey: "category_id" });
Product.belongsTo(Category, { foreignKey: "category_id" });

// Relaciones de pedidos
Customer.hasMany(Order, { foreignKey: "customer_id" });
Order.belongsTo(Customer, { foreignKey: "customer_id" });

User.hasMany(Order, { foreignKey: "user_id" });
Order.belongsTo(User, { foreignKey: "user_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Product.hasMany(OrderItem, { foreignKey: "product_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

// Relaciones de notificaciones
User.hasMany(Notification, { foreignKey: "userId" });
Notification.belongsTo(User, { foreignKey: "userId" });

// Relaciones de cotizaciones
User.hasMany(Quote, { foreignKey: "userId" });
Quote.belongsTo(User, { foreignKey: "userId" });

Customer.hasMany(Quote, { foreignKey: "customerId" });
Quote.belongsTo(Customer, { foreignKey: "customerId" });

Quote.hasMany(QuoteItem, { foreignKey: "quoteId" });
QuoteItem.belongsTo(Quote, { foreignKey: "quoteId" });

Product.hasMany(QuoteItem, { foreignKey: "productId" });
QuoteItem.belongsTo(Product, { foreignKey: "productId" });

// Relaciones de pagos
Customer.hasMany(PaymentMethod, { foreignKey: "customer_id" });
PaymentMethod.belongsTo(Customer, { foreignKey: "customer_id" });

Order.hasMany(Payment, { foreignKey: "order_id" });
Payment.belongsTo(Order, { foreignKey: "order_id" });

PaymentMethod.hasMany(Payment, { foreignKey: "paymentMethod_id" });
Payment.belongsTo(PaymentMethod, { foreignKey: "paymentMethod_id" });

Payment.hasMany(PaymentTransaction, { foreignKey: "payment_id" });
PaymentTransaction.belongsTo(Payment, { foreignKey: "payment_id" });

User.hasMany(Payment, { foreignKey: "processedBy_id" });
Payment.belongsTo(User, { foreignKey: "processedBy_id" });

// Relaciones de facturas
Customer.hasMany(Invoice, { foreignKey: "customer_id" });
Invoice.belongsTo(Customer, { foreignKey: "customer_id" });

User.hasMany(Invoice, { foreignKey: "user_id" });
Invoice.belongsTo(User, { foreignKey: "user_id" });

Order.hasOne(Invoice, { foreignKey: "order_id" });
Invoice.belongsTo(Order, { foreignKey: "order_id" });

Invoice.hasMany(InvoiceItem, { foreignKey: "invoice_id" });
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoice_id" });

Product.hasMany(InvoiceItem, { foreignKey: "product_id" });
InvoiceItem.belongsTo(Product, { foreignKey: "product_id" });

// Relaciones fiscales DGII
NcfSequence.hasMany(Invoice, { foreignKey: "ncfSequence_id" });
Invoice.belongsTo(NcfSequence, { foreignKey: "ncfSequence_id" });

Invoice.hasMany(CreditDebitNote, { foreignKey: "invoice_id" });
CreditDebitNote.belongsTo(Invoice, { foreignKey: "invoice_id" });

Customer.hasMany(CreditDebitNote, { foreignKey: "customer_id" });
CreditDebitNote.belongsTo(Customer, { foreignKey: "customer_id" });

User.hasMany(CreditDebitNote, { foreignKey: "user_id" });
CreditDebitNote.belongsTo(User, { foreignKey: "user_id" });

NcfSequence.hasMany(CreditDebitNote, { foreignKey: "ncfSequence_id" });
CreditDebitNote.belongsTo(NcfSequence, { foreignKey: "ncfSequence_id" });

module.exports = {
  User,
  Customer,
  Category,
  Product,
  Order,
  OrderItem,
  Notification,
  Quote,
  QuoteItem,
  PaymentMethod,
  Payment,
  PaymentTransaction,
  Invoice,
  InvoiceItem,
  Company,
  NcfSequence,
  CreditDebitNote
};
