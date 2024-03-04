import dotenv from "dotenv";
import connectToDatabase from "./src/db/index.js";
import app from "./src/app.js";

dotenv.config({
    path: "./.env",
});

connectToDatabase()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(
                `Server is running on port: ${process.env.PORT || 8000}`
            );
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed !!!", err);
    });
