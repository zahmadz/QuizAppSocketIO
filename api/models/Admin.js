const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    logout_at: Date,
  },
  {
    timestamps: true,
  }
);

AdminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

AdminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

AdminSchema.methods.isLoggedOut = function (iat) {
  if (!this.logout_at) return false;

  const isAlreadyLogout = this.logout_at.getTime() / 1000;
  return isAlreadyLogout > iat;
};

module.exports = mongoose.model("Admin", AdminSchema);
