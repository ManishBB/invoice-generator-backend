import { Invoice } from "../models/Invoice.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get the file path
const __filename = fileURLToPath(import.meta.url);

// Get the directory name
const __dirname = dirname(__filename);

const createInvoice = async (req, res) => {
    const { pdfData } = req.body;

    const { products, total, gst, totalWithGst } = pdfData;

    const newInvoice = new Invoice({
        products: products,
        total: total,
        gst: gst,
        totalWithGst: totalWithGst,
    });

    const createdInvoice = await newInvoice.save();

    // Generate PDF
    const doc = new PDFDocument();
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
        let pdfData = Buffer.concat(buffers);
        res.writeHead(200, {
            "Content-Length": Buffer.byteLength(pdfData),
            "Content-Type": "application/pdf",
            "Content-disposition": "attachment;filename=invoice.pdf",
        }).end(pdfData);
    });

    // Header
    doc.fontSize(20).text("Invoice Generator", 50, 50);
    doc.image(`${__dirname}/trophy.png`, 500, 45, { width: 30 }); // Adjust path and dimensions as needed

    // Table Headings
    doc.moveDown();
    doc.fontSize(14).text("Product Name", 50, 100);
    doc.text("Quantity", 200, 100);
    doc.text("Rate", 300, 100);
    doc.text("Total", 400, 100);

    // Separator Line
    doc.moveTo(50, 120).lineTo(550, 120).stroke();

    // Products List
    let y = 130;
    products.forEach((product) => {
        doc.fontSize(12).text(product.name, 50, y);
        doc.text(product.quantity, 200, y);
        doc.text(product.rate, 300, y);
        doc.text(product.rate * product.quantity, 400, y);
        y += 20;
    });

    // Final Separator Line
    doc.moveTo(50, y).lineTo(550, y).stroke();

    // Totals
    doc.fontSize(12).text(`Total: ${total}`, 400, y + 20);
    doc.text(`GST (18%): ${gst}`, 400, y + 40);
    doc.text(`Grand Total: ${totalWithGst}`, 400, y + 60);

    // Footer with Terms & Conditions
    doc.rect(
        doc.page.margins.left,
        doc.page.height - 50,
        doc.page.width - doc.page.margins.right * 2,
        50
    ).fill("#000");
    doc.fillColor("#FFF")
        .fontSize(10)
        .text("Terms and Conditions", 50, doc.page.height - 40, {
            width: 500,
            align: "center",
        });

    doc.end();
};

export { createInvoice };

// doc.fontSize(25).text("Invoice", 100, 80);

// // List products
// let y = 180;
// products.forEach((product) => {
//     doc.text(
//         `Product: ${product.name}, Quantity: ${product.quantity}, Rate: ${product.rate}`,
//         100,
//         y
//     );
//     y += 20;
// });

// doc.text(`Total: ${total}`, 100, 120);
// doc.text(`GST (18%): ${gst}`, 100, 140);
// doc.text(`Total with GST: ${totalWithGst}`, 100, 160);
// doc.end();
