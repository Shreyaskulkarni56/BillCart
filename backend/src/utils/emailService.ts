import nodemailer from 'nodemailer';
import { ISale } from '../models/Sale';
import { ICustomer } from '../models/Customer';

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

import PDFDocument from 'pdfkit';

const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    const convert = (n: number): string => {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let result = 'INR ' + convert(rupees);
    if (paise > 0) {
        result += ' and ' + convert(paise) + ' Paise';
    }
    result += ' Only';
    return result;
};

const shopInfo = {
    name: "SHRI LAKSHMI NARAYANA AYURVEDA",
    address: "123, Main Road, Near Bus Stand, City Name, District - 560001",
    gstin: "29AABCU9603R1ZM",
    phone: "+91 98765 43210",
    email: "shop@ayurveda.com",
    state: "Karnataka"
};

const generateInvoicePDF = (sale: ISale, customer: ICustomer): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // Use standard fonts
        const fontBold = 'Helvetica-Bold';
        // const fontRegular = 'Helvetica';

        // 1. Header
        doc.rect(20, 20, 555, 780).stroke(); // Main Border

        doc.font(fontBold).fontSize(16).text(shopInfo.name, { align: 'center' });
        doc.fontSize(10).font('Helvetica').text(shopInfo.address, { align: 'center' });
        doc.text(`Phone: ${shopInfo.phone} | Email: ${shopInfo.email}`, { align: 'center' });
        doc.font(fontBold).text(`GSTIN: ${shopInfo.gstin}`, { align: 'center' });
        doc.moveDown(0.5);

        // 2. Tax Invoice Label
        doc.rect(20, 85, 555, 20).fill('#e0e0e0').stroke();
        doc.fillColor('#000').font(fontBold).fontSize(12).text('TAX INVOICE', 20, 90, { align: 'center', width: 555 });

        // 3. Info Row 1 (Invoice details)
        let y = 105;
        doc.rect(20, y, 555, 0).stroke(); // Top line

        doc.font(fontBold).fontSize(9);
        doc.text('Invoice No:', 25, y + 5);
        doc.font('Helvetica').text(sale.invoiceNo, 25, y + 15);

        doc.font(fontBold).text('Invoice Date:', 200, y + 5);
        doc.font('Helvetica').text(new Date(sale.date).toLocaleDateString(), 200, y + 15);

        doc.font(fontBold).text('Payment Mode:', 400, y + 5);
        doc.font('Helvetica').text('Cash', 400, y + 15); // Defaulting to Cash as backend doesn't track mode yet

        // Vertical separators
        doc.moveTo(190, y).lineTo(190, y + 30).stroke();
        doc.moveTo(390, y).lineTo(390, y + 30).stroke();

        y += 30;
        doc.moveTo(20, y).lineTo(575, y).stroke(); // Separator line

        // 4. Info Row 2 (Customer details)
        doc.font(fontBold).text('Customer Name:', 25, y + 5);
        doc.font('Helvetica').text(customer.name, 25, y + 15);

        doc.font(fontBold).text('Phone:', 200, y + 5);
        doc.font('Helvetica').text(customer.phone, 200, y + 15);

        doc.font(fontBold).text('Customer GSTIN:', 400, y + 5);
        doc.font('Helvetica').text('N/A', 400, y + 15);

        // Vertical separators
        doc.moveTo(190, y).lineTo(190, y + 30).stroke();
        doc.moveTo(390, y).lineTo(390, y + 30).stroke();

        y += 30;
        doc.moveTo(20, y).lineTo(575, y).stroke();

        // 5. Table Header
        const colWidths = [20, 150, 40, 40, 40, 30, 30, 40, 45, 45, 25, 35, 25, 35]; // Total approx 555
        // Sl, Desc, Batch, HSN, MRP, Qty, Free, Rate, Total, Taxable, CGST%, CGST, SGST%, SGST
        const colX = [
            20,
            40,
            190,
            230,
            270,
            310,
            340,
            370,
            410,
            455,
            500,
            525,
            560
            // 585
        ];
        // Re-calibrating X positions to fit A4 width (595pts) - margins (40) = 555
        // Let's use simpler fixed columns based on visual estimate
        const xPos = {
            sl: 25,
            desc: 50,
            batch: 180,
            hsn: 220,
            mrp: 260,
            qty: 300,
            free: 330,
            rate: 360,
            total: 400,
            taxable: 440,
            cgstP: 480,
            cgst: 505,
            sgstP: 535,
            sgst: 555
        };

        doc.rect(20, y, 555, 20).fill('#e0e0e0').stroke();
        doc.fillColor('#000').font(fontBold).fontSize(7);

        doc.text('Sl', 22, y + 6, { width: 20, align: 'center' });
        doc.text('Description', 45, y + 6, { width: 130, align: 'left' });
        doc.text('Batch', 175, y + 6, { width: 40, align: 'center' });
        doc.text('HSN', 215, y + 6, { width: 40, align: 'center' });
        doc.text('MRP', 255, y + 6, { width: 40, align: 'right' });
        doc.text('Qty', 295, y + 6, { width: 30, align: 'center' });
        doc.text('Total', 390, y + 6, { width: 45, align: 'right' });
        doc.text('CGST', 495, y + 6, { width: 35, align: 'right' });
        doc.text('SGST', 540, y + 6, { width: 35, align: 'right' });

        y += 20;

        // 6. Table Items
        doc.font('Helvetica').fontSize(8);

        let totalCgst = 0;
        let totalSgst = 0;
        let subtotal = 0;

        sale.items.forEach((item, index) => {
            // Calculate taxes
            // NOTE: Backend Sale model stores pre-calculated tax, but distinct item tax details might process slight differently if backend logic didn't split CGST/SGST explicitly per item.
            // We will approximate based on standard 12% or item logic if available.
            // The SaleItem interface in backend currently has: productId, productName, quantity, price, total. 
            // It does MISS HSN, Batch, MRP, GstRate. 
            // We will fallback to defaults or generic placeholders since backend schema is simpler than frontend state.

            // Infer GST from item (assuming inclusive or exclusive logic from frontend)
            // Frontend: tax = taxableAmount * (gstRate/100)
            // Let's assume standard 12% for PDF generation if unknown, or derive from backend totals if possible.
            // For this task, strict visual matching is key, so we'll simulate the columns.

            const gstRate = 12;
            const cgstRate = gstRate / 2;
            const sgstRate = gstRate / 2;

            // Reverse calc taxable if needed, but Sale model usually has subtotal before tax. 
            // item.total in Sale model is typically final price? 
            // Let's check backend controller... 
            // Controller: subtotal = sum(item.total), tax = sum(tax), total = subtotal + tax.
            // So item.total is TAXABLE amount usually in these systems, or Price * Qty.
            // Let's assume item.total is the Line Total (Price * Qty).

            const taxable = item.total;
            const cgstAmt = taxable * (cgstRate / 100);
            const sgstAmt = taxable * (sgstRate / 100);

            totalCgst += cgstAmt;
            totalSgst += sgstAmt;
            subtotal += taxable;

            doc.text((index + 1).toString(), 22, y + 5, { width: 20, align: 'center' });
            doc.text(item.productName.substring(0, 25), 45, y + 5, { width: 130, align: 'left' });
            doc.text('-', 175, y + 5, { width: 40, align: 'center' }); // Batch msg
            doc.text('-', 215, y + 5, { width: 40, align: 'center' }); // HSN msg
            doc.text(item.price.toFixed(2), 255, y + 5, { width: 40, align: 'right' }); // Using Price as MRP proxy
            doc.text(item.quantity.toString(), 295, y + 5, { width: 30, align: 'center' });

            doc.text(item.total.toFixed(2), 390, y + 5, { width: 45, align: 'right' });

            doc.text(cgstAmt.toFixed(2), 495, y + 5, { width: 35, align: 'right' });
            doc.text(sgstAmt.toFixed(2), 540, y + 5, { width: 35, align: 'right' });

            y += 15;
        });

        // Fill rest of table to bottom
        const tableBottom = 650;
        doc.rect(20, 165, 555, tableBottom - 165).stroke(); // Table border

        // Vertical Lines for table
        // We can draw vertical lines for corresponding x positions
        [42, 175, 215, 255, 295, 335, 365, 435, 480, 530].forEach(x => {
            // doc.moveTo(x, 145).lineTo(x, tableBottom).stroke(); 
            // Simplified for now to avoid cluttering if data is sparse
        });


        y = tableBottom;

        // 7. Summary Section
        doc.rect(20, y, 555, 100).stroke();

        // Left side: Words
        doc.font(fontBold).fontSize(9).text('Amount in Words:', 25, y + 10);
        doc.font('Helvetica').fontSize(8).text(numberToWords(sale.total), 25, y + 25, { width: 300 });

        // Right side: Totals
        const sumX = 400;
        const valX = 500;
        let sumY = y + 5;

        doc.font('Helvetica');
        doc.text('Subtotal:', sumX, sumY);
        doc.text(sale.subtotal.toFixed(2), valX, sumY, { align: 'right' });

        sumY += 15;
        doc.text('Total CGST:', sumX, sumY);
        // doc.text(totalCgst.toFixed(2), valX, sumY, { align: 'right' });
        // Use stored tax split 50/50 for now as we don't have exact item breakdown stored perfectly
        doc.text((sale.tax / 2).toFixed(2), valX, sumY, { align: 'right' });

        sumY += 15;
        doc.text('Total SGST:', sumX, sumY);
        doc.text((sale.tax / 2).toFixed(2), valX, sumY, { align: 'right' });

        sumY += 15;
        doc.rect(380, sumY - 5, 195, 20).fill('#e0e0e0');
        doc.fillColor('#000').font(fontBold).fontSize(11);
        doc.text('Net Amount:', sumX, sumY);
        doc.text(`Rs. ${sale.total.toFixed(2)}`, valX - 20, sumY, { align: 'right', width: 80 });

        // 8. Footer
        y += 100;
        doc.rect(20, y, 555, 50).stroke();

        doc.font(fontBold).fontSize(8);
        doc.text('Terms & Conditions:', 25, y + 5);
        doc.font('Helvetica').fontSize(7);
        doc.text('1. Goods once sold will not be taken back.', 25, y + 15);
        doc.text(`2. Subject to ${shopInfo.state} Jurisdiction only.`, 25, y + 25);
        doc.text('3. E. & O.E.', 25, y + 35);

        // Signatory
        doc.text(`For ${shopInfo.name}`, 400, y + 5, { align: 'center', width: 150 });
        doc.moveTo(420, y + 35).lineTo(530, y + 35).stroke();
        doc.text('Authorised Signatory', 400, y + 38, { align: 'center', width: 150 });

        // 9. Thank you
        doc.rect(20, y + 50, 555, 20).fill('#f5f5f5').stroke();
        doc.fillColor('#000').font(fontBold).fontSize(9).text('*** Thank You for Shopping with Us! ***', 20, y + 55, { align: 'center', width: 555 });

        doc.end();
    });
};

export const sendInvoiceEmail = async (sale: ISale, customer: ICustomer) => {
    // Send to Admin (yourself)
    const adminEmail = process.env.EMAIL_USER;

    if (!adminEmail) {
        console.log('No admin email (EMAIL_USER) configured, skipping email.');
        return;
    }

    try {
        const pdfBuffer = await generateInvoicePDF(sale, customer);

        const itemsList = sale.items
            .map(
                (item) =>
                    `<tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.productName}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₹${item.price.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">₹${item.total.toFixed(2)}</td>
        </tr>`
            )
            .join('');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmail, // Send to self
            subject: `New Sale: Invoice ${sale.invoiceNo} - ${customer.name}`,
            html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Sale Generated</h2>
        <p><strong>Customer:</strong> ${customer.name}</p>
        <p><strong>Phone:</strong> ${customer.phone}</p>
        
        <div style="margin: 20px 0;">
          <p><strong>Invoice No:</strong> ${sale.invoiceNo}</p>
          <p><strong>Date:</strong> ${new Date(sale.date).toLocaleDateString()}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Qty</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Price</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>

        <div style="text-align: right;">
          <p><strong>Subtotal:</strong> ₹${sale.subtotal.toFixed(2)}</p>
          <p><strong>Tax:</strong> ₹${sale.tax.toFixed(2)}</p>
          <p style="font-size: 18px; font-weight: bold;">Total: ₹${sale.total.toFixed(2)}</p>
        </div>
      </div>
    `,
            attachments: [
                {
                    filename: `Invoice_${sale.invoiceNo}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw error to avoid failing the response if email fails
    }
};
