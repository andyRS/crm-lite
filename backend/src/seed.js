require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize } = require("./config/db");
const { User, Customer, Product, Category, Quote, QuoteItem } = require("./models");

const BCRYPT_ROUNDS = 12;

const seedDatabase = async () => {
  try {
    console.log("🌱 Iniciando seed de base de datos...");

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log("✅ Conexión a base de datos exitosa");

    // Sincronizar modelos
    await sequelize.sync();
    console.log("📦 Modelos sincronizados");

    // Limpiar datos anteriores
    console.log("🧹 Limpiando datos anteriores...");
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await Quote.destroy({ where: {}, truncate: true });
    await QuoteItem.destroy({ where: {}, truncate: true });
    await Customer.destroy({ where: {}, truncate: true });
    await Product.destroy({ where: {}, truncate: true });
    await Category.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Crear usuarios de prueba
    console.log("👥 Creando usuarios...");
    const testUsers = [
      {
        name: "Admin User",
        email: "admin@crm-lite.com",
        password: "Admin123!",
        role: "admin",
      },
      {
        name: "Manager User",
        email: "manager@crm-lite.com",
        password: "Manager123!",
        role: "manager",
      },
      {
        name: "Regular User",
        email: "user@crm-lite.com",
        password: "User123!",
        role: "user",
      },
    ];

    const users = [];
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      });
      users.push(user);
      console.log(`  ✅ ${user.email} (${user.role})`);
    }

    // Crear categorías de productos
    console.log("📁 Creando categorías...");
    const categories = [];
    const categoryNames = ["Software", "Hardware", "Servicios", "Consultorías"];
    for (const categoryName of categoryNames) {
      const category = await Category.create({ name: categoryName, description: `Categoría de ${categoryName}` });
      categories.push(category);
      console.log(`  ✅ ${categoryName}`);
    }

    // Crear productos
    console.log("📦 Creando productos...");
    const products = [];
    const productData = [
      { name: "Laptop Dell Inspiron 15", price: 799.99, category: 1, stock: 15 },
      { name: "Monitor LG 27 pulgadas 4K", price: 449.99, category: 1, stock: 20 },
      { name: "Teclado Mecánico RGB", price: 129.99, category: 1, stock: 30 },
      { name: "Mouse Logitech Inalámbrico", price: 49.99, category: 1, stock: 50 },
      { name: "Cable HDMI 2.1", price: 19.99, category: 0, stock: 100 },
      { name: "Headphones Sony WH-1000XM5", price: 399.99, category: 1, stock: 12 },
      { name: "Webcam Logitech 4K", price: 149.99, category: 1, stock: 25 },
      { name: "Memory USB 3.0 64GB", price: 29.99, category: 0, stock: 80 },
      { name: "SSD Samsung 1TB NVMe", price: 89.99, category: 0, stock: 40 },
      { name: "Router TP-Link WiFi 6", price: 159.99, category: 1, stock: 18 }
    ];

    for (const prod of productData) {
      const product = await Product.create({
        name: prod.name,
        price: prod.price,
        categoryId: categories[prod.category].id,
        stock: prod.stock
      });
      products.push(product);
      console.log(`  ✅ ${prod.name} - $${prod.price}`);
    }

    // Crear clientes
    console.log("👤 Creando clientes...");
    const customers = [];
    const clientData = [
      {
        name: "Juan García",
        lastName: "López",
        cedula: "40123456789",
        email: "juan.garcia@empresa1.com",
        phone: "15551111111",
        address: "Calle Principal 123, Santo Domingo, DR",
        company: "Empresa Ejemplo S.A.",
        status: "active"
      },
      {
        name: "María Rodríguez",
        lastName: "Martínez",
        cedula: "40198765432",
        email: "maria.rodriguez@empresa2.com",
        phone: "15552222222",
        address: "Avenida Central 456, Santiago, DR",
        company: "Negocio Digital",
        status: "active"
      },
      {
        name: "Carlos Peña",
        lastName: "Flores",
        cedula: "40111223344",
        email: "carlos.pena@empresa3.com",
        phone: "15553333333",
        address: "Boulevard Turístico 789, Punta Cana, DR",
        company: "Servicios Financieros",
        status: "active"
      },
      {
        name: "Ana Moreno",
        lastName: "Silva",
        cedula: "40155667788",
        email: "ana.moreno@empresa4.com",
        phone: "15554444444",
        address: "Calle Comercial 321, Santo Domingo, DR",
        company: "Comercio Electrónico",
        status: "active"
      },
      {
        name: "Roberto Díaz",
        lastName: "Sánchez",
        cedula: "40199887766",
        email: "roberto.diaz@empresa5.com",
        phone: "15555555555",
        address: "Avenida Industrial 654, La Romana, DR",
        company: "Manufactura Global",
        status: "active"
      }
    ];

    for (const clientInfo of clientData) {
      const customer = await Customer.create({
        ...clientInfo,
        userId: users[0].id,
        clientId: `CLI-${(customers.length + 1).toString().padStart(3, '0')}`
      });
      customers.push(customer);
      console.log(`  ✅ ${customer.name} ${customer.lastName} (${customer.company})`);
    }

    // Crear cotizaciones de ejemplo
    console.log("📄 Creando cotizaciones...");
    const today = new Date();
    const quotesData = [
      {
        quoteNumber: "QT-2025-001",
        customerId: customers[0].id,
        userId: users[0].id,
        status: "draft",
        items: [
          { productId: products[0].id, quantity: 2, discount: 0 },
          { productId: products[1].id, quantity: 2, discount: 5 }
        ],
        discount: 0,
        notes: "Paquete de 2 laptops y 2 monitores para oficina"
      },
      {
        quoteNumber: "QT-2025-002",
        customerId: customers[1].id,
        userId: users[0].id,
        status: "sent",
        items: [
          { productId: products[0].id, quantity: 1, discount: 0 },
          { productId: products[5].id, quantity: 1, discount: 10 },
          { productId: products[6].id, quantity: 2, discount: 0 }
        ],
        discount: 5,
        notes: "Equipamiento completo para estación de trabajo profesional"
      },
      {
        quoteNumber: "QT-2025-003",
        customerId: customers[2].id,
        userId: users[1].id,
        status: "approved",
        items: [
          { productId: products[2].id, quantity: 3, discount: 0 },
          { productId: products[3].id, quantity: 3, discount: 0 },
          { productId: products[1].id, quantity: 1, discount: 0 }
        ],
        discount: 10,
        notes: "Cotización aprobada - Periféricos para múltiples estaciones"
      },
      {
        quoteNumber: "QT-2025-004",
        customerId: customers[3].id,
        userId: users[0].id,
        status: "rejected",
        items: [
          { productId: products[8].id, quantity: 2, discount: 0 }
        ],
        discount: 0,
        notes: "Cotización rechazada por el cliente"
      },
      {
        quoteNumber: "QT-2025-005",
        customerId: customers[4].id,
        userId: users[1].id,
        status: "sent",
        items: [
          { productId: products[9].id, quantity: 1, discount: 0 },
          { productId: products[7].id, quantity: 5, discount: 8 },
          { productId: products[4].id, quantity: 10, discount: 0 }
        ],
        discount: 0,
        notes: "Componentes de red e infraestructura de conexión"
      }
    ];

    for (const quoteData of quotesData) {
      const validUntil = new Date(today);
      validUntil.setDate(validUntil.getDate() + 30);

      let subtotal = 0;
      for (const item of quoteData.items) {
        const product = await Product.findByPk(item.productId);
        subtotal += product.price * item.quantity;
      }

      const discountAmount = (subtotal * quoteData.discount) / 100;
      const total = subtotal - discountAmount;

      const quote = await Quote.create({
        quoteNumber: quoteData.quoteNumber,
        customerId: quoteData.customerId,
        userId: quoteData.userId,
        status: quoteData.status,
        total,
        validUntil,
        notes: quoteData.notes,
        discount: quoteData.discount
      });

      for (const itemData of quoteData.items) {
        const product = await Product.findByPk(itemData.productId);
        await QuoteItem.create({
          quoteId: quote.id,
          productId: itemData.productId,
          quantity: itemData.quantity,
          price: product.price,
          discount: itemData.discount
        });
      }

      console.log(`  ✅ ${quote.quoteNumber} - ${quote.Customer?.name} ($${quote.total.toFixed(2)})`);
    }

    console.log("\n✨ Seed completado exitosamente!");
    console.log("\n📊 Resumen:");
    console.log(`  • ${users.length} usuarios creados`);
    console.log(`  • ${categories.length} categorías creadas`);
    console.log(`  • ${products.length} productos creados`);
    console.log(`  • ${customers.length} clientes creados`);
    console.log(`  • ${quotesData.length} cotizaciones creadas`);

    console.log("\n👥 Credenciales para probar:");
    console.log("┌──────────┬─────────────────────────┬──────────────┐");
    console.log("│ Rol      │ Email                   │ Contraseña   │");
    console.log("├──────────┼─────────────────────────┼──────────────┤");
    console.log("│ 👑 Admin │ admin@crm-lite.com      │ Admin123!    │");
    console.log("│ 👔 Manager│ manager@crm-lite.com    │ Manager123!  │");
    console.log("│ 👤 User  │ user@crm-lite.com       │ User123!     │");
    console.log("└──────────┴─────────────────────────┴──────────────┘");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
};

seedDatabase();
