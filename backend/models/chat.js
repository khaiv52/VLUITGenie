const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    guest: {
      type: Boolean,
      default: false
    },
    userId: {
      type: String,
      required: function () {
        return !this.guest;
      },
    },
    history: [
      {
        role: {
          type: String,
          enum: ["user", "model"],
          required: true,
        },
        parts: [
          {
            text: {
              type: String,
              required: true,
            },
          },
        ],
        img: {
          type: String,
          required: false,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.chat || mongoose.model("Chat", chatSchema);
