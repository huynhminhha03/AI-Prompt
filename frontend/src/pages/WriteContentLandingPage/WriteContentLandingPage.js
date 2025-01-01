import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./WriteContentLandingPage.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const WriteContentLandingPage = () => {
  const { setModalType } = useContext(ModalTypeContext);

  const [selectedModel, setSelectedModel] = useState("");
  const [product, setProduct] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateContent = async () => {
    setLoading(true);
    setResult(""); // Reset kết quả cũ
const token = localStorage.getItem("token");
    if(!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      // Tạo prompt cho landing page
      const prompt = `Viết nội dung cho landing page giới thiệu sản phẩm hoặc dịch vụ "${product}". 
      Chi tiết mô tả: "${description}". 
      Nội dung cần hấp dẫn, chuẩn SEO, dễ đọc và khuyến khích hành động từ khách hàng.`;

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
        setResult((prev) => prev + data); // Dồn dữ liệu vào kết quả
      };

      // Xử lý lỗi
      eventSource.onerror = (error) => {
        eventSource.close();
        setLoading(false);
      };

      // Kết thúc kết nối
      eventSource.onclose = () => {
        console.log("SSE connection closed.");
        setLoading(false);
      };
    } catch (error) {
      console.error("Error generating content:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Viết nội dung Landing page</h1>
      <p className={cx("subtitle")}>
        Tạo nội dung cho landing page để bạn dễ dàng đưa vào thiết kế
      </p>

      <div className={cx("form")}>
        {/* AI Model */}
        <div>
          <ModelAI
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
          
        </div>

        {/* Product */}
        <div className={cx("formGroup")}>
          <label htmlFor="product">Sản phẩm/Dịch vụ</label>
          <input
            id="product"
            type="text"
            className={cx("input")}
            placeholder="Nhập tên sản phẩm hoặc dịch vụ"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className={cx("formGroup")}>
          <label htmlFor="description">Mô tả ý chính</label>
          <textarea
            id="description"
            className={cx("textarea")}
            placeholder="Nhập mô tả chi tiết"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Generate Button */}
        <button
          className={cx("button")}
          onClick={handleGenerateContent}
          disabled={!product || !description || loading}
        >
          {loading ? "Đang tạo nội dung..." : "Viết nội dung"}
        </button>
      </div>

      {/* Result */}
      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default WriteContentLandingPage;
