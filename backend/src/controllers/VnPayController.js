const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');
const request = require('request');
const PaymentTransaction = require('../models/PaymentTransaction');
const Wallet = require('../models/Wallet');
require('dotenv').config();
class VnpayController {
  constructor() {
    this.tmnCode = process.env.VNP_TMN_CODE;
    this.secretKey = process.env.VNP_HASH_SECRET;
    this.vnpUrl = process.env.VNP_URL;
    this.returnUrl = process.env.VNP_RETURN_URL;
    this.vnpApi = process.env.VNP_API;
    this.feUrl = process.env.FE_URL;
  }

  async createPaymentUrl(req, res) {
    try {
      const id = req.user.id;
      process.env.TZ = 'Asia/Ho_Chi_Minh';
      const date = new Date();
      const createDate = moment(date).format('YYYYMMDDHHmmss');
      const ipAddr = this.getIpAddress(req);
      const orderId = moment(date).format('DDHHmmss');
      const { amount, bankCode, language } = { ...req.body };
  
      // Tạo các tham số thanh toán
      const vnp_Params = this.getPaymentParams({
        amount,
        bankCode,
        createDate,
        ipAddr,
        language,
        orderId
      });
  
      // Lưu giao dịch thanh toán vào database
      await PaymentTransaction.create({
        id: orderId,
        user_id: id,
        amount: amount,
        status: 'pending' // Đánh dấu trạng thái giao dịch ban đầu
      });
  
      // Tạo chuỗi dữ liệu ký
      const signData = querystring.stringify(vnp_Params, { encode: false });
      vnp_Params['vnp_SecureHash'] = this.generateHmac(signData);
  
      // Tạo URL thanh toán
      const paymentUrl = `${this.vnpUrl}?${querystring.stringify(vnp_Params, { encode: false })}`;
  
      // Trả về URL và status
      return res.status(200).json({
        status: 'success',
        paymentUrl: paymentUrl,
        orderId: orderId,
      });
    } catch (error) {
      console.error("Error in createPaymentUrl:", error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create payment URL',
      });
    }
  }
  
  vnpayReturn(req, res) {
    const vnp_Params = { ...req.query };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const signData = querystring.stringify(this.sortObject(vnp_Params), { encode: false });
    const signed = this.generateHmac(signData);

    const responseCode = secureHash === signed ? vnp_Params['vnp_ResponseCode'] : '97';
    const message = responseCode === '00' ? 'Success' : 'Transaction failed';
    res.redirect(`${this.feUrl}/payment?code=${responseCode}&message=${message}`);
  }
  async vnpayIpn(req, res) {
    const vnp_Params = { ...req.query };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const signData = querystring.stringify(this.sortObject(vnp_Params), { encode: false });
    const signed = this.generateHmac(signData);

    if (secureHash !== signed) {
      return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
    }

    const rspCode = vnp_Params['vnp_ResponseCode'];
    const orderId = vnp_Params['vnp_TxnRef'];
    const order = await PaymentTransaction.findByPk(orderId);
    if(!order){
      return res.status(200).json({ RspCode: '02', Message: 'Transaction not found' });
    }
    if(rspCode==="00"){
      order.status = 'success';
      await order.save();
      const amount = order.amount;
      const user_id = order.user_id;
      const wallet = await Wallet.findOne({where: {
        user_id: user_id
      }});
      wallet.balance = wallet.balance + amount;
      await wallet.save();
      res.status(200).json({ RspCode: '00', Message: 'Transaction success' });
    }
    else {
      order.update({status: 'failed'});
      res.status(200).json({ RspCode: '02', Message: 'Transaction failed' });
    }
  }
  refund(req, res) {
    const date = new Date();
    const { orderId, transDate, amount, transType, user } = req.body;

    const vnp_Params = {
      vnp_RequestId: moment(date).format('HHmmss'),
      vnp_Version: '2.1.0',
      vnp_Command: 'refund',
      vnp_TmnCode: this.tmnCode,
      vnp_TransactionType: transType,
      vnp_TxnRef: orderId,
      vnp_Amount: amount * 100,
      vnp_TransactionDate: transDate,
      vnp_CreateBy: user,
      vnp_CreateDate: moment(date).format('YYYYMMDDHHmmss'),
      vnp_IpAddr: this.getIpAddress(req),
      vnp_OrderInfo: `Hoan tien GD ma: ${orderId}`,
    };

    vnp_Params['vnp_SecureHash'] = this.generateHmac(this.getSignData(vnp_Params));

    request(
      {
        url: this.vnpApi,
        method: 'POST',
        json: true,
        body: vnp_Params,
      },
      (error, response) => {
        console.log(response);
      }
    );
  }

  getPaymentParams({ amount, bankCode, createDate, ipAddr, language, orderId }) {
    return this.sortObject({
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: language || 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan cho ma GD: ${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      ...(bankCode && { vnp_BankCode: bankCode }),
    });
  }

  sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }

  generateHmac(data) {
    return crypto.createHmac('sha512', this.secretKey).update(new Buffer(data, 'utf-8')).digest('hex');
  }

  getIpAddress(req) {
    return (
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress
    );
  }
}
module.exports = new VnpayController();