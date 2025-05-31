"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var CartItemSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    sku: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
});
exports.default = mongoose_1.default.models.CartItem || mongoose_1.default.model("CartItem", CartItemSchema);
