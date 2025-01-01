import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./CreateProductFromGPT.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const CreateProductFromGPT = () => {
  const [selectedModel, setSelectedModel] = useState("");
  const [product, setProduct] = useState("");
  const [mainKeyword, setMainKeyword] = useState("");
  const [relatedKeywords, setRelatedKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [outline, setOutline] = useState(`    Đối tượng
    Nhu cầu được thỏa mãn
    Tính năng sản phẩm
    Lợi ích sản phẩm 
    Cam kết 
    Chính sách bán hàng
    Hướng dẫn sử dụng
    Kêu gọi mua hàng`);

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const { setModalType } = useContext(ModalTypeContext);

  // Kiểm tra tính hợp lệ của form
  const validateForm = () => {
    setIsFormValid(product.trim() && description.trim() && mainKeyword.trim());
  };

  useEffect(() => {
    validateForm();
  }, [product, description, mainKeyword]);

  // Hàm tạo kịch bản
  const handleGenerateScript = async () => {
    setLoading(true);
    setResult(""); // Reset lại kết quả cũ trước khi tạo mới
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      const prompt = `
Tạo bài viết sản phẩm với các yêu cầu:
- Tên sản phẩm: "${product}".
- Từ khóa chính: "${mainKeyword}".
- Từ khóa liên quan: "${relatedKeywords}".
- Mô tả: "${description}".
- Cấu trúc bài viết:
${outline || `Đối tượng, Nhu cầu được thỏa mãn, Tính năng, Lợi ích, Cam kết, Chính sách bán hàng, Hướng dẫn sử dụng, Kêu gọi mua hàng`}.
`;

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

      eventSource.onerror = () => {
        eventSource.close();
        setLoading(false);
      };

      eventSource.onclose = () => {
        setLoading(false);
      };
    } catch (error) {
      console.error("Error generating script:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Tạo bài sản phẩm/dịch vụ với GPT</h1>
      <p className={cx("subtitle")}>
        Tạo bài sản phẩm trên website hoặc sàn thương mại điện tử. Có thể dùng
        viết mô tả dịch vụ, khi đó cần ghi rõ dịch vụ gì trong tên.
      </p>

      {/* Form */}
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
            placeholder="Nhập tên sản phẩm/dịch vụ"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
          <small className={cx("note")}>
            Ghi rõ thể loại, tên thương hiệu. Nếu là dịch vụ ghi rõ dịch vụ gì.
          </small>
        </div>

        {/* Từ khóa chính */}
        <div className={cx("formGroup")}>
          <label htmlFor="mainKeyword">Từ khóa chính</label>
          <input
            id="mainKeyword"
            type="text"
            className={cx("input")}
            placeholder="Nhập từ khóa chính"
            value={mainKeyword}
            onChange={(e) => setMainKeyword(e.target.value)}
          />
        </div>

        {/* Từ khóa liên quan */}
        <div className={cx("formGroup")}>
          <label htmlFor="relatedKeywords">Từ khóa liên quan (Nếu có)</label>
          <textarea
            id="relatedKeywords"
            className={cx("textarea")}
            placeholder="Liệt kê từ khóa liên quan (nếu có)"
            rows="3"
            value={relatedKeywords}
            onChange={(e) => setRelatedKeywords(e.target.value)}
          />
        </div>

        {/* Mô tả */}
        <div className={cx("formGroup")}>
          <label htmlFor="description">Mô tả tóm tắt</label>
          <textarea
            id="description"
            className={cx("textarea")}
            placeholder="Liệt kê đặc điểm, tính năng, công dụng, lợi ích khác biệt..."
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <small className={cx("note")}>
            Liệt kê đặc điểm, tính năng, công dụng, lợi ích khác biệt. Nếu là
            dịch vụ thì ghi rõ những nội dung phục vụ khách.
          </small>
        </div>

        {/* Cấu trúc bài viết */}
        <div className={cx("formGroup")}>
          <label htmlFor="outline">Cấu trúc bài sản phẩm dự kiến</label>

          <textarea
            id="outline"
            className={cx("textarea")}
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            rows="8"
          />
          <small className={cx("note")}>
            Giữ nguyên cấu trúc này, hoặc tự sửa lại cấu trúc theo ý bạn
          </small>
        </div>

        {/* Nút tạo kịch bản */}
        <button
          className={cx("button")}
          onClick={handleGenerateScript}
          disabled={!isFormValid || loading}
        >
          {loading ? "Đang tạo kịch bản..." : "Tạo kịch bản"}
        </button>
      </div>

      {/* Kết quả */}
      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default CreateProductFromGPT;
