import { useState, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./CreateGiftCode.module.scss";
import InputWrapper from "~/components/InputWrapper";
import Spinner from "~/components/Spinner";
import { handleInputBlur } from "~/utils/handleInputBlur";
import { adminApis, authAPI } from "~/utils/api";

const cx = classNames.bind(styles);

function CreateGiftCode({ setReload, reload }) {
  const [code, setCode] = useState({ value: "", error: "" });
  const [amount, setAmount] = useState({ value: "", error: "" });
  const [expiredAt, setExpiredAt] = useState({ value: "", error: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const codeInputRef = useRef(null);

  const handleChange = (setter) => (e) => {
    setter({ value: e.target.value, error: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await authAPI().post(adminApis.createGiftCode ,{
        code: code.value,
        amount: amount.value,
        expired_at: expiredAt.value,
      });
      setReload(!reload);
    } catch (error) {
      console.error("Error creating gift code:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={cx("create-giftcode-form")} onSubmit={handleSubmit}>
      <h1 className={cx("form-heading")}>TẠO GIFTCODE</h1>
      <InputWrapper>
        <div className={cx("label-group")}>
          <label className={cx("label")}>Mã quà tặng</label>
        </div>
        <div className={cx("input-wrap", { invalid: code.error })}>
          <input
            autoFocus
            placeholder="Nhập mã quà tặng"
            name="code"
            type="text"
            value={code.value}
            onChange={handleChange(setCode)}
            ref={codeInputRef}
            onBlur={() => handleInputBlur(code.value, setCode)}
          />
        </div>
        {code.error && <div className={cx("error-message")}>{code.error}</div>}
      </InputWrapper>

      <InputWrapper>
        <div className={cx("label-group")}>
          <label className={cx("label")}>Số tiền</label>
        </div>
        <div className={cx("input-wrap", { invalid: amount.error })}>
          <input
            placeholder="Nhập số tiền"
            name="amount"
            type="number"
            value={amount.value}
            onChange={handleChange(setAmount)}
            required
            onBlur={() => handleInputBlur(amount.value, setAmount)}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Chỉ cho phép số
            }}
          />
        </div>
        {amount.error && (
          <div className={cx("error-message")}>{amount.error}</div>
        )}
      </InputWrapper>

      <InputWrapper>
        <div className={cx("label-group")}>
          <label className={cx("label")}>Ngày hết hạn</label>
        </div>
        <div className={cx("input-wrap")}>
          <input
            placeholder="YYYY-MM-DD"
            name="expiredAt"
            type="date"
            value={expiredAt.value}
            onChange={handleChange(setExpiredAt)}
          />
        </div>
      </InputWrapper>

      <InputWrapper>
        <button
          type="submit"
          disabled={
            code.value === "" ||
            amount.value === "" ||
            expiredAt.value === "" ||
            isSubmitting
          }
          className={cx("submit-btn", {
            disabled:
              code.value === "" ||
              amount.value === "" ||
              expiredAt.value === "" ||
              isSubmitting,
            loading: isSubmitting,
            rounded: true,
            primary: true,
          })}
        >
          {isSubmitting ? <Spinner /> : "Tạo mã"}
        </button>
      </InputWrapper>
    </form>
  );
}

export default CreateGiftCode;
