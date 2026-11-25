// Seed script – generates real bcrypt hashes and inserts demo data
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const pool   = require('../config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Seeding database…');
  const hash = await bcrypt.hash('Password123!', 10);

  // Roles
  await pool.query(`INSERT IGNORE INTO roles (name) VALUES ('Admin'),('Driver'),('Customer')`);

  // Users
  await pool.query(`DELETE FROM users WHERE email IN (
    'admin@logitrack.com','ravi@logitrack.com','priya@logitrack.com',
    'john@customer.com','ananya@customer.com')`);

  const users = [
    ['Admin User',   'admin@logitrack.com',   hash, 1, '9000000001'],
    ['Ravi Kumar',   'ravi@logitrack.com',     hash, 2, '9000000002'],
    ['Priya Sharma', 'priya@logitrack.com',    hash, 2, '9000000003'],
    ['John Doe',     'john@customer.com',      hash, 3, '9000000004'],
    ['Ananya Singh', 'ananya@customer.com',    hash, 3, '9000000005'],
  ];
  for (const u of users) {
    await pool.query(
      'INSERT INTO users (name,email,password,role_id,phone) VALUES (?,?,?,?,?)', u
    );
  }

  // Vehicles
  await pool.query(`INSERT IGNORE INTO vehicles (plate_number,type,capacity_kg,status) VALUES
    ('MH12AB1234','Van',  800, 'Available'),
    ('MH12CD5678','Bike',  30, 'Available'),
    ('MH12EF9012','Truck',5000,'Available')`);

  // Drivers
  const [[ravi]]  = await pool.query('SELECT id FROM users WHERE email=?',['ravi@logitrack.com']);
  const [[priya]] = await pool.query('SELECT id FROM users WHERE email=?',['priya@logitrack.com']);
  const [[v1]]    = await pool.query('SELECT id FROM vehicles WHERE plate_number=?',['MH12AB1234']);
  const [[v2]]    = await pool.query('SELECT id FROM vehicles WHERE plate_number=?',['MH12CD5678']);

  await pool.query(`INSERT IGNORE INTO drivers (user_id,vehicle_id,license_no,status) VALUES
    (${ravi.id},  ${v1.id}, 'MH-DL-12345','Available'),
    (${priya.id}, ${v2.id}, 'MH-DL-67890','Available')`);

  // Customers
  const [[john]]   = await pool.query('SELECT id FROM users WHERE email=?',['john@customer.com']);
  const [[ananya]] = await pool.query('SELECT id FROM users WHERE email=?',['ananya@customer.com']);
  await pool.query(`INSERT IGNORE INTO customers (user_id,company,address,city) VALUES
    (${john.id},   'Doe Enterprises','12 MG Road','Mumbai'),
    (${ananya.id}, 'Singh & Co',     '45 Park St','Pune')`);

  // Sample orders
  const [[cust1]] = await pool.query('SELECT id FROM customers WHERE user_id=?',[john.id]);
  const [[drv1]]  = await pool.query('SELECT id FROM drivers WHERE user_id=?',[ravi.id]);
  await pool.query(`INSERT IGNORE INTO orders
    (tracking_id,customer_id,driver_id,status,priority,
     pickup_address,pickup_city,delivery_address,delivery_city,weight_kg,distance_km,estimated_eta)
    VALUES
    ('LTDEMO00001',${cust1.id},${drv1.id},'In Transit','Express',
     '12 MG Road, Mumbai','Mumbai','45 Park St, Pune','Pune',2.5,150,
     DATE_ADD(NOW(),INTERVAL 1 DAY)),
    ('LTDEMO00002',${cust1.id},NULL,'Pending','Standard',
     '5 Juhu Beach, Mumbai','Mumbai','22 Linking Rd, Bandra','Mumbai',1.0,15,
     DATE_ADD(NOW(),INTERVAL 3 DAY))`);

  console.log('✅ Seed complete!');
  console.log('\nSample logins (password: Password123!):');
  console.log('  Admin:    admin@logitrack.com');
  console.log('  Driver:   ravi@logitrack.com');
  console.log('  Customer: john@customer.com');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
