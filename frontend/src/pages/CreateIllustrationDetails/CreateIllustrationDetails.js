import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./CreateIllustrationDetails.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const CreateIllustrationDetails = () => {
  const [selectedModel, setSelectedModel] = useState("");
  const [product, setProduct] = useState("");
  const { setModalType } = useContext(ModalTypeContext);
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("Chuyên nghiệp");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false); // Trạng thái hợp lệ của form

  // Hàm kiểm tra tính hợp lệ của biểu mẫu
  const validateForm = () => {
    setIsFormValid(product.trim());
  };

  // Gọi kiểm tra mỗi khi một trường thay đổi
  useEffect(() => {
    validateForm();
  }, [product]);

  // Hàm tạo hình ảnh
  const handleGenerateIllustration = async () => {
    setLoading(true);
    setResult(""); // Reset lại kết quả cũ trước khi tạo mới
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      const prompt = `Sáng tạo các prompt "${product}" .`;

      const eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setResult((prev) => prev + data); // Dồn dữ liệu trả về vào result
      };

      eventSource.onerror = (error) => {
        eventSource.close();
        setLoading(false);
      };

      eventSource.onclose = () => {
        console.log("SSE connection closed.");
        setLoading(false);
      };
    } catch (error) {
      console.error("Error generating illustration:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Sáng tạo hình ảnh sản phẩm</h1>
      <p className={cx("subtitle")}>
        Sáng tạo các prompt để tạo nền sản phẩm đẹp
      </p>

      {/* Form */}
      <div className={cx("form")}>
        {/* Model Selection */}
        <ModelAI
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />

        {/* Product */}
        <div className={cx("formGroup")}>
          <label htmlFor="product">Tên sản phẩm</label>
          <input
            id="product"
            type="text"
            className={cx("input")}
            placeholder="Nhập tên sản phẩm"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
          <small className={cx("smallstyle")}>
            Ghi rõ thể loại chi tiết và quy cách đóng gói
          </small>
        </div>

        {/* Button */}
        <button
          className={cx("button")}
          onClick={handleGenerateIllustration}
          disabled={!isFormValid || loading}
        >
          {loading ? "Đang tạo.." : "Sáng tạo ý tưởng"}
        </button>
      </div>

      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default CreateIllustrationDetails;
