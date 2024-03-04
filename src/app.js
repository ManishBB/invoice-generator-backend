import express from "express";
import cors from "cors";

const app = express();

app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));

//test route
app.get("/api/v1/test", async (req, res) => {
    res.send("This is a test route");
});

//importing routes
import authRouter from "./routes/auth.routes.js";
import invoiceRouter from "./routes/invoice.routes.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/invoice", invoiceRouter);

export default app;
