import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./ProductImageCreation.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const ProductImageCreation = () => {
  const { setModalType } = useContext(ModalTypeContext);

  const [model, setModel] = useState("GPT-4o Mini");
  const [product, setProduct] = useState(""); // Tên sản phẩm
  const [details, setDetails] = useState(""); // Ghi rõ thể loại chi tiết và quy cách đóng gói
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(""); // Danh sách ngôn ngữ
  const handleGeneratePrompt = async () => {
    setLoading(true);
    setResult(""); // Reset kết quả cũ
    const token = localStorage.getItem("token");

    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }

    try {
      // Tạo prompt cho hình ảnh sản phẩm
      const prompt = `Tạo prompt để thiết kế hình ảnh sản phẩm "${product}" với chi tiết sau: "${details}". 
      Prompt cần mô tả hình ảnh đẹp, chuyên nghiệp, hấp dẫn và dễ gây ấn tượng với khách hàng.`;

      // Kết nối với server bằng SSE
      const eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Nhận dữ liệu từ server
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setResult((prev) => prev + data);
      };

      // Xử lý lỗi
      eventSource.onerror = () => {
        eventSource.close();
        setLoading(false);
      };

      // Kết thúc kết nối
      eventSource.onclose = () => {
        console.log("SSE connection closed.");
        setLoading(false);
      };
    } catch (error) {
      console.error("Error generating prompt:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Sáng tạo hình sản phẩm</h1>
      <p className={cx("subtitle")}>
        Sáng tạo các prompt để tạo nền sản phẩm đẹp
      </p>

      <div className={cx("form")}>
        {/* AI Model */}
        <div>
          <ModelAI
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>

        {/* Tên sản phẩm */}
        <div className={cx("formGroup")}>
          <label htmlFor="product">Tên sản phẩm</label>
          <input
            id="product"
            type="text"
            className={cx("input")}
            placeholder="Nhập tên sản phẩm (VD: Hộp kem dưỡng da)"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>
        {/* Chi tiết sản phẩm */}
        <div className={cx("formGroup")}>
          <label htmlFor="details">Chi tiết sản phẩm</label>
          <textarea
            id="details"
            className={cx("input")}
            placeholder="Nhập chi tiết sản phẩm (VD: Loại da, dung tích, thành phần)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>
      
        {/* Generate Button */}
        <button
          className={cx("button")}
          onClick={handleGeneratePrompt}
          disabled={!product.trim() || loading}
        >
          {loading ? "Đang tạo..." : "Sáng tạo ý tưởng"}
        </button>
      </div>

      {/* Kết quả */}
      <div className={cx("formGroup")}>
        <ResultPrompt content={result} loading={loading} />
      </div>
    </div>
  );
};

export default ProductImageCreation;
