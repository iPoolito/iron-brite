const Session = require("../models/session.model");
const User = require("../models/user.model");
const createError = require("http-errors");

module.exports.create = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        user
          .checkPassword(password)
          .then((match) => {
            if (match) {
              // if (!user.active) {
              //   next(createError(401, "user not active"));
              //   return;
              // }

              // create session key and send it to the user via set-cookie header
              Session.create({ user: user.id })
                .then((session) => {
                  res.setHeader(
                    "Set-Cookie",
                    `session=${session.id}; HttpOnly; Secure`
                  );

                  res.json(user);
                })
                .catch(next);
            } else {
              next(createError(401, "bad credentials (wrong password)"));
            }
          })
          .catch(next);
      } else {
        next(createError(401, "bad credentials (user not found)"));
      }
    })
    .catch(next);
};

module.exports.destroy = (req, res, next) => {
  req.session
    .remove()
    .then(() => res.status(204).send())
    .catch(next);
};
