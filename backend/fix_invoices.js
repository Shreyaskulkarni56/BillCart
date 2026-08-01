const mongoose = require('mongoose');

const clusterUri = 'mongodb+srv://Srinathon003:Srinathon1234@cluster0.ecummvq.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

async function updateInvoices() {
  try {
    const clusterConn = await mongoose.createConnection(clusterUri).asPromise();
    const sales = await clusterConn.collection('sales').find().toArray();
    for (const sale of sales) {
      if (sale.invoiceNo) {
        const numericPart = sale.invoiceNo.replace(/\D/g, '');
        if (numericPart) {
          const newInvoiceNo = 'SLN' + String(parseInt(numericPart, 10)).padStart(4, '0');
          await clusterConn.collection('sales').updateOne({_id: sale._id}, {$set: {invoiceNo: newInvoiceNo}});
        }
      }
    }
    console.log('Fixed existing invoices to SLN0001 format!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
updateInvoices();
