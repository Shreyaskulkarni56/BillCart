const mongoose = require('mongoose');

const localUri = 'mongodb://localhost:27017/shopease';
const clusterUri = 'mongodb+srv://Srinathon003:Srinathon1234@cluster0.ecummvq.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
  try {
    console.log('Connecting to Local DB...');
    const localConn = await mongoose.createConnection(localUri).asPromise();
    console.log('Fetching local data...');
    const products = await localConn.collection('products').find().toArray();
    const customers = await localConn.collection('customers').find().toArray();
    const sales = await localConn.collection('sales').find().toArray();
    
    console.log('Found ' + products.length + ' products, ' + customers.length + ' customers, ' + sales.length + ' sales locally.');
    
    console.log('Connecting to Cluster DB...');
    const clusterConn = await mongoose.createConnection(clusterUri).asPromise();
    
    console.log('Clearing old cluster data...');
    await clusterConn.collection('products').deleteMany({});
    await clusterConn.collection('customers').deleteMany({});
    await clusterConn.collection('sales').deleteMany({});
    
    console.log('Inserting into Cluster DB...');
    if (products.length > 0) await clusterConn.collection('products').insertMany(products);
    if (customers.length > 0) await clusterConn.collection('customers').insertMany(customers);
    if (sales.length > 0) await clusterConn.collection('sales').insertMany(sales);
    
    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

migrate();
