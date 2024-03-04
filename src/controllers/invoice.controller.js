import { Invoice } from "../models/Invoice.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import PDFDocument from "pdfkit";
import fs from "fs";

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

    doc.fontSize(25).text("Invoice", 100, 80);

    // List products
    let y = 180;
    products.forEach((product) => {
        doc.text(
            `Product: ${product.name}, Quantity: ${product.quantity}, Rate: ${product.rate}`,
            100,
            y
        );
        y += 20;
    });

    doc.text(`Total: ${total}`, 100, 120);
    doc.text(`GST (18%): ${gst}`, 100, 140);
    doc.text(`Total with GST: ${totalWithGst}`, 100, 160);
    doc.end();
};

export { createInvoice };
