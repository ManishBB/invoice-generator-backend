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
    try {
        if (!req.body.pdfData) {
            return res.status(400).json({ error: "No invoice data provided." });
        }

        const { pdfData } = req.body;
        const { products, total, gst, totalWithGst } = pdfData;

        // Validate the necessary fields in pdfData
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res
                .status(400)
                .json({ error: "Invoice must include at least one product." });
        }
        if (typeof total !== "number" || total <= 0) {
            return res
                .status(400)
                .json({ error: "Total must be a positive number." });
        }
        if (typeof gst !== "number" || gst < 0) {
            return res
                .status(400)
                .json({ error: "GST must be a non-negative number." });
        }
        if (typeof totalWithGst !== "number" || totalWithGst <= 0) {
            return res
                .status(400)
                .json({ error: "Total with GST must be a positive number." });
        }

        const newInvoice = new Invoice({
            products: products,
            total: total,
            gst: gst,
            totalWithGst: totalWithGst,
        });

        const createdInvoice = await newInvoice.save();

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

        doc.fontSize(20)
            .font("Helvetica-Bold")
            .text("Invoice Generator", 50, 50);
        doc.image(`${__dirname}/logo.png`, 450, 45, { width: 100 }); // Adjust path and dimensions as needed

        doc.moveDown();
        doc.fontSize(14).text("Product Name", 50, 100);
        doc.text("Qty", 200, 100);
        doc.text("Rate", 300, 100);
        doc.text("Total", 400, 100);

        doc.moveTo(50, 120).lineTo(550, 120).stroke();

        let y = 130;
        products.forEach((product) => {
            doc.fontSize(12).font("Helvetica").text(product.name, 50, y);
            doc.fillColor("blue").text(product.quantity, 200, y);
            doc.fillColor("black").text(product.rate, 300, y);
            doc.text("INR " + product.rate * product.quantity, 400, y);
            y += 20;
        });

        doc.moveTo(50, y).lineTo(550, y).stroke();

        doc.fontSize(12)
            .font("Helvetica-Bold")
            .text(`Total:`, 380, y + 20);
        doc.font("Helvetica")
            .fontSize(12)
            .text(`${total}`, 485, y + 20);
        doc.fillColor("gray").text(`GST:`, 380, y + 40);
        doc.text(`18%`, 490, y + 40);
        doc.moveTo(380, y + 60)
            .lineTo(550, y + 60)
            .stroke();
        doc.fillColor("black")
            .font("Helvetica-Bold")
            .text(`Grand Total:`, 380, y + 70);
        doc.fillColor("blue").text(`${totalWithGst}`, 500, y + 70);
        doc.moveTo(380, y + 90)
            .lineTo(550, y + 90)
            .stroke();

        const footerImagePath = `${__dirname}/tnc.png`;
        const imageWidth = 500;
        const imageHeight = 70;
        const imageX = 50;
        const imageY =
            doc.page.height - doc.page.margins.bottom - imageHeight + 40;

        doc.image(footerImagePath, imageX, imageY, {
            width: imageWidth,
            height: imageHeight,
        });

        doc.end();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error." });
    }
};

export { createInvoice };
