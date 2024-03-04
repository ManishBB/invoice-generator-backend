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
    const { name, email, password } = req.body;

    if ([name, email, password].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email: email });

    if (existedUser) throw new ApiError(409, "User already exists");

    const newUser = await User.create({
        name,
        email,
        password,
    });

    const createdUser = await User.findById(newUser._id).select("-password");

    if (!createdUser)
        throw new ApiError(
            500,
            "Something went wrong while creating a new user"
        );

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        throw new ApiError(403, "Invalid email or password");

    const user = await User.findOne({ email: email });

    if (!user) throw new ApiError(404, "User not found");

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) throw new ApiError(401, "Invalid credentials");

    const { accessToken } = await generateAccessToken(user._id);

    const loggedInUser = await User.findOne(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res.status(200).cookie("accessToken", accessToken, options).json({
        loggedInUser,
        accessToken: accessToken,
    });
};

export { registerUser, loginUser };
