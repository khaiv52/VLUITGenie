const mongoose = require("mongoose");

const ExternalAccountSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // ID duy nhất của tài khoản bên ngoài
    provider: { type: String, required: true }, // Tên nhà cung cấp (ví dụ: 'google', 'github')
    providerUserId: { type: String, required: true }, // ID người dùng từ nhà cung cấp
    emailAddress: { type: String }, // Email từ nhà cung cấp
    imageUrl: { type: String },
    approvedScopes: [{ type: String }], // Các phạm vi quyền mà người dùng đã chấp thuận
    label: { type: String }, // Nhãn mô tả để phân biệt nhiều tài khoản bên ngoài của cùng người dùng cho cùng nhà cung cấp
    verification: {
      status: {
        type: String,
        enum: ["verified", "unverified"],
        default: "unverified",
      },

      error: { type: String },
    },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // ID duy nhất từ Clerk
  username: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  // fullName: { type: String },
  email: { type: String },
  imageUrl: { type: String },
  hasImage: { type: Boolean },
  hasVerifiedEmail: { type: Boolean },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  lastSignInAt: { type: Date },
  role: { type: String }, // Vai trò người dùng (ví dụ: 'admin', 'user')
  publicMetadata: { type: mongoose.Schema.Types.Mixed }, // Dữ liệu metadata công khai
  privateMetadata: { type: mongoose.Schema.Types.Mixed }, // Dữ liệu metadata riêng tư
  externalAccounts: [ExternalAccountSchema], // Mảng các tài khoản bên ngoài
});

module.exports = mongoose.model("User", UserSchema);
