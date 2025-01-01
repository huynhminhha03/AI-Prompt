const User = require("../models/User");
const Wallet = require("../models/Wallet");
const TokenUsage = require("../models/TokenUsage");
const bcrypt = require("bcryptjs");
const jwtService = require("../services/JWTService"); // Import the JWT service
const mailerService = require("../services/MailerService"); // Import the Mailer service
const cacheService = require("../services/CacheService"); // Import the Cache service
const Common = require("../helpers/Common");
const { Op } = require("sequelize");
const PaymentTransaction = require("../models/PaymentTransaction");
const Conversation = require("../models/Conversation");
const Bot = require("../models/Bot");

class UserController {
  constructor() {}
  async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res
          .status(404)
          .send({ message: "Không tìm thấy người dùng", code: -1 });
      }
      user.password = undefined; // Remove password from response
      res.status(200).send({
        message: "Người dùng được tìm thấy",
        code: 1,
        user,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async verifyEmail(req, res) {
    const token = req.query.token;
    const user = cacheService.get(token);
    if (!user) {
      return res.redirect(
        `${process.env.FE_URL}/user/verify-email?status=failure`
      );
    }

    user.is_email_verified = true;
    await user.save();
    cacheService.delete(token);
    const wallet = new Wallet({
      user_id: user.id,
      balance: 5000,
      expired_at: new Date(new Date().setDate(new Date().getDate() + 5)),
    });
    await wallet.save();
    return res.redirect(
      `${process.env.FE_URL}/user/verify-email?token?${token}&status=success`
    );
  }
  async forgetPassword(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).send({
        message: "Không tìm thấy người dùng",
        code: -1,
      });
    }
    const token = Common.generateToken();
    cacheService.set(token, user);
    mailerService.sendMail(
      user.email,
      "Đặt lại mật khẩu của bạn",
      `
            <p>Chào ${user.name},</p>
            <p> Bạn có 5 phút để đặt lại mật khẩu của mình.</p>
            <p>Nhấp vào <a href="${process.env.BASE_URL}/user/reset-password?token=${token}&status=success">đây</a> để đặt lại mật khẩu của bạn.</p>
            <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>`
    );
    return res.status(200).send({
      message: "Vui lòng kiểm tra email của bạn",
      code: 1,
    });
  }
  async resetPassword(req, res) {
    const token = req.query.token;
    const user = cacheService.get(token);
    if (!user) {
      return res.redirect(
        `${process.env.FE_URL}/?action=reset_password&status=failure`
      );
    }

    const password = Common.generateToken(8);
    user.password = await bcrypt.hash(password, 8);
    await user.save();
    cacheService.delete(token);
    return res.redirect(
      `${process.env.FE_URL}/login?action=reset_password&status=success&password=${password}&email=${user.email}`
    );
  }

  async changePassword(req, res) {
    const { old_password, new_password, re_password, email } = req.body;
    if (new_password !== re_password) {
      return res.status(400).send({ message: "Mật khẩu không khớp", code: -1 });
    }
    const isValid = Common.regexStrongPassword(new_password);
    if (!isValid) {
      return res.status(400).send({
        message:
          "Mật khẩu phải có ít nhất 8 ký tự, chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường và một số",
        code: -1,
      });
    }
    const user = await User.findOne({ where: { email } });
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .send({ message: "Mật khẩu không hợp lệ", code: -1 });
    }
    user.password = await bcrypt.hash(new_password, 8);
    await user.save();
    return res
      .status(200)
      .send({ message: "Đổi mật khẩu thành công", code: 1 });
  }

  async updatePassword(req, res) {
    const { old_password, new_password, re_password } = req.body;
    if (new_password !== re_password) {
      return res.status(400).send({ message: "Mật khẩu không khớp", code: -1 });
    }
    const isValid = Common.regexStrongPassword(new_password);
    if (!isValid) {
      return res.status(400).send({
        message:
          "Mật khẩu phải có ít nhất 8 ký tự, chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường và một số",
        code: -1,
      });
    }
    const user = await User.findByPk(req.user.id);
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .send({ message: "Mật khẩu hiện tại không hợp lệ", code: -1 });
    }
    user.password = await bcrypt.hash(new_password, 8);
    await user.save();
    return res
      .status(200)
      .send({ message: "Đổi mật khẩu thành công", code: 1 });
  }

  async updateUser(req, res) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "phone"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Cập nhật không hợp lệ!" });
    }

    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).send({ message: "Không tìm thấy người dùng" });
      }

      updates.forEach((update) => (user[update] = req.body[update]));

      await user.save();
      res.status(200).send({
        message: "Người dùng đã được cập nhật",
        code: 1,
        user,
      });
    } catch (error) {
      res.status(400).send(error);
    }
  }
  async login(req, res) {
    try {
      const { account, password } = req.body;

      const user = await User.findOne({
        where: {
          [Op.or]: [
            { phone: account },
            { email: account },
            { username: account },
          ],
        },
      });

      if (!user) {
        return res.status(404).send({
          message: "Không tìm thấy người dùng",
          isValid: false,
          code: -1,
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .send({ message: "Mật khẩu không hợp lệ", isValid: false, code: -1 });
      }
      const token = jwtService.generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
      });
      user.password = undefined;
      res.status(200).send({
        message: "Đăng nhập thành công",
        code: 1,
        user,
        token,
      });
    } catch (error) {
      res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  async logout(req, res) {
    try {
      return res.status(200).send({ message: "Đăng xuất thành công", code: 1 });
    } catch (error) {
      res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }
  async registerUser(req, res) {
    try {
      const { re_password, username, email, password, phone, name } = req.body;
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ phone: phone }, { email: email }, { username: username }],
        },
      });

      if (existingUser) {
        if (existingUser.phone === phone) {
          return res
            .status(400)
            .send({ message: "Số điện thoại đã tồn tại", code: -1 });
        }
        if (existingUser.email === email) {
          return res
            .status(400)
            .send({ message: "Email đã tồn tại", code: -1 });
        }
        if (existingUser.username === username) {
          return res
            .status(400)
            .send({ message: "Tên người dùng đã tồn tại", code: -1 });
        }
      }
      if (password !== re_password) {
        return res
          .status(400)
          .send({ message: "Mật khẩu không khớp", code: -1 });
      }
      const token = Common.generateToken();
      const user = new User({ username, email, password, phone, name });
      const { message, isValid } = Common.checkValidUserInfo(user);
      if (!isValid) {
        return res.status(400).send({
          message: message,
          code: -1,
        });
      }
      user.password = await bcrypt.hash(password, 8);
      cacheService.set(token, user);
      mailerService.sendMail(
        user.email,
        "Xác minh email của bạn",
        `
                <p>Chào ${user.name},</p>
                <p> Bạn có 5 phút để xác minh email của mình.</p>
                <p>Nhấp vào <a href="${process.env.BASE_URL}/user/verify-email?token=${token}&status=success">đây</a> để xác minh email của bạn.</p>
                <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>`
      );
      res.status(201).send({
        message: "Vui lòng xác minh email của bạn",
        code: 1,
      });
    } catch (error) {
      res.status(400).send({
        message: error.message,
        code: -1,
      });
    }
  }

  async getAllGiftCodes(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const giftCodes = await GiftCode.findAndCountAll({
      limit,
      offset,
    });
    return res.json({
      giftCodes: giftCodes.rows,
      totalPages: Math.ceil(giftCodes.count / limit),
    });
  }

  async getAllPaymentTransactions(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
      const paymentTransactions = await PaymentTransaction.findAndCountAll({
        limit,
        offset,
        where: { user_id: req.user.id, status: "success" },
      });
      return res.json({
        paymentTransactions: paymentTransactions.rows,
        totalPages: Math.ceil(paymentTransactions.count / limit),
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
        code: -1,
      });
    }
  }

  async checkBalance(req, res) {
    const user = await User.findByPk(req.user.id);
    const wallet = await Wallet.findOne({ where: { user_id: user.id } });
    if (wallet.balance < 1000) {
      return res.status(400).send({
        message: "Số dư không đủ",
        code: -1,
      });
    }
    next();
  }

  async getAllConversations(req, res) {
    const { page = 1, limit = 9 } = req.query;
    const offset = (page - 1) * limit;

    const conversations = await Conversation.findAndCountAll({
      where: {
        user_id: req.user.id,
        content: { [Op.ne]: null },
      },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      conversations: conversations.rows,
      totalPages: Math.ceil(conversations.count / limit),
    });
  }
  async getUsageHistory(req, res) {
    // get token usage history of the user
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    try {
      const tokenUsages = await TokenUsage.findAndCountAll({
      where: { user_id: req.user.id },
      limit,
      offset,
      order: [["usage_date", "DESC"]],
      });

      const botIds = tokenUsages.rows.map((usage) => usage.bot_id);
      const bots = await Bot.findAll({
      where: { id: botIds },
      });

      const tokenUsagesWithRates = tokenUsages.rows.map((usage) => {
      const bot = bots.find((b) => b.id === usage.bot_id);
      return {
        ...usage.toJSON(),
        input_rate: bot ? bot.input_rate : null,
        output_rate: bot ? bot.output_rate : null,
      };
      });

      return res.json({
      tokenUsages: tokenUsagesWithRates,
      totalPages: Math.ceil(tokenUsages.count / limit),
      });
    } catch (error) {
      return res.status(500).send({
      message: error.message,
      code: -1,
      });
    }
  }

  async getMostRecentConversations(req, res) {
    const { page = 1, limit = 3 } = req.query;
    const offset = (page - 1) * limit;

    const conversations = await Conversation.findAndCountAll({
      where: {
        user_id: req.user.id,
        content: { [Op.ne]: null },
      },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      conversations: conversations.rows,
      totalPages: Math.ceil(conversations.count / limit),
    });
  }
  // Xem thông tin chi tiết của conversation
  async getConversationDetail(req, res) {
    const conversation = await Conversation.findByPk(req.params.id);
    if (!conversation) {
      return res.status(404).send({
        message: "Không tìm thấy cuộc trò chuyện",
        code: -1,
      });
    }
    return res.status(200).send({
      message: "Thông tin chi tiết cuộc trò chuyện",
      code: 1,
      conversation,
    });
  }
}

module.exports = new UserController();
