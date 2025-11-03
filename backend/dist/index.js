"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const sensor_1 = __importDefault(require("./routes/sensor"));
const ispu_1 = __importDefault(require("./routes/ispu"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const merge_1 = __importDefault(require("./routes/merge"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const allowedOrigins = ["http://localhost:3000", "https://capstone-07.vercel.app/"];
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
mongoose_1.default.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
app.get("/", (req, res) => {
    res.send("Capstone Backend Service!");
});
app.use("/api/sensors", sensor_1.default);
app.use("/api/merge", merge_1.default);
app.use("/api/ispu", ispu_1.default);
app.use("/api/auth", auth_1.default);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
