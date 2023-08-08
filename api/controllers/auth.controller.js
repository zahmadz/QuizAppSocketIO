const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const SendResWithJWT = (res, _id) => {
  const { JWT_SECRET_KEY, JWT_EXPIRES_IN } = process.env;

  const token = jwt.sign(
    {
      _id,
    },
    JWT_SECRET_KEY,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  res.status(200).json({
    status: "ok",
  });
};

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) return next(new Error("Username or password is invalid."));

    if (!(await admin.comparePassword(password)))
      return next(new Error("Username or password is invalid."));

    SendResWithJWT(res, admin._id);
  } catch (error) {
    next(error);
  }
}

async function signUp(req, res, next) {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (admin) {
      return next(
        new Error(
          "Username already exists. Please choose a different username."
        )
      );
    }

    const newAdmin = await Admin.create({
      username,
      password,
    });

    SendResWithJWT(res, newAdmin._id);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies?.token;
    const { _id } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const currentAdmin = await Admin.findById(_id);
    console.log(currentAdmin);
    if (currentAdmin) {
      currentAdmin.logout_at = new Date();
      await currentAdmin.save();
    }

    res.cookie("token", "");
    res.clearCookie("token");
    res.end();
  } catch (error) {
    next(error);
  }
}

async function protect(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return next(new Error("Access denied. Please provide a valid token."));
  }

  const { _id, iat } = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const currentAdmin = await Admin.findById(_id);
  if (!currentAdmin || currentAdmin.isLoggedOut(iat))
    return next(new Error("Access denied. Please provide a valid token."));

  req.loggedInAdmin = currentAdmin;

  next();
}

module.exports = {
  login,
  signUp,
  protect,
  logout,
};
