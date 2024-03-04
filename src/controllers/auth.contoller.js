import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = await user.generateAccessToken();

        return { accessToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong");
    }
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ error: "Name, email, and password are required." });
        }

        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(409).json({ error: "User already exists." });
        }

        // Assuming createUser is a function that handles user creation and hashing of the password
        const newUser = await createUser({ name, email, password });

        return res
            .status(201)
            .json({ message: "User created successfully.", user: newUser });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error." });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email and password are required." });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const { accessToken } = await generateAccessToken(user._id);

        const loggedInUser = await User.findOne(user._id).select("-password");

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .json({
                loggedInUser,
                accessToken: accessToken,
            });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error." });
    }
};

export { registerUser, loginUser };
