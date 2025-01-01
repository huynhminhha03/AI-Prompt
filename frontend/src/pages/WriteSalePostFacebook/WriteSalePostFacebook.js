import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./WriteSalePostFacebook.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill"; // Thêm thư viện EventSource Polyfill
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const WriteSalePostFacebook = () => {
  const [selectedModel, setSelectedModel] = useState("");
  const [model, setModel] = useState("GPT-4o Mini");
  const [postType, setPostType] = useState("Sản phẩm");
  const [product, setProduct] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { setModalType } = useContext(ModalTypeContext);

  // Hàm xử lý tạo bài đăng
  const handleGenerateContent = async () => {
    if (!product || !description) return;

    setLoading(true);
    setResult(""); // Reset lại kết quả cũ trước khi tạo mới
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    const prompt = `
      Bạn là một copywriter chuyên nghiệp với kinh nghiệm tạo bài viết bán hàng hiệu quả trên Facebook.
      Dựa trên thông tin sau:
      - Loại: "${postType}"
      - Sản phẩm/Dịch vụ: "${product}"
      - Mô tả ý chính: "${description}"
      
      Viết bài đăng Facebook ngắn gọn, hấp dẫn và thuyết phục để bán ${postType.toLowerCase()} này. 
      Sử dụng giọng văn thân thiện, chuyên nghiệp và kêu gọi hành động rõ ràng. 
      Kết quả là một bài viết hoàn chỉnh (không quá dài).
    `;

    try {
      const eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${selectedModel}`,
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
      console.error("Error generating content:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Facebook - Viết bài đăng bán</h1>
      <p className={cx("subtitle")}>
        Viết bài đăng Facebook để đăng profile hoặc fanpage bán sản phẩm/dịch
        vụ.
      </p>

      <div className={cx("form")}>
      <div>
          <ModelAI
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
          
        </div>

        {/* Loại đăng bán */}
        <div className={cx("formGroup")}>
          <label htmlFor="postType">Loại đăng bán</label>
          <select
            id="postType"
            className={cx("select")}
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
          >
            <option value="Sản phẩm">Sản phẩm</option>
            <option value="Dịch vụ">Dịch vụ</option>
          </select>
        </div>

        {/* Sản phẩm/Dịch vụ */}
        <div className={cx("formGroup")}>
          <label htmlFor="product">Sản phẩm/Dịch vụ</label>
          <input
            id="product"
            type="text"
            className={cx("input")}
            placeholder="Vd: Áo thun nam, Bàn trà gỗ, Dịch vụ thiết kế website"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>

        {/* Mô tả */}
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

        {/* Nút tạo bài đăng */}
        <button
          className={cx("button")}
          onClick={handleGenerateContent}
          disabled={loading || !product || !description}
        >
          {loading ? "Đang tạo nội dung..." : "Tạo bài đăng"}
        </button>
      </div>

      {/* Kết quả */}
      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default WriteSalePostFacebook;
