import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./BusinessIntroductionArticle.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const BusinessIntroductionArticle = () => {
  const [selectedModel, setSelectedModel] = useState("");
  const [brandName, setBrandName] = useState("");
  const [field, setField] = useState("Mỹ phẩm thiên nhiên");
  const [positioning, setPositioning] = useState("");
  const [description, setDescription] = useState("");
  const { setModalType } = useContext(ModalTypeContext);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Kiểm tra tính hợp lệ của biểu mẫu
  const validateForm = () => {
    setIsFormValid(
      brandName.trim() &&
        positioning.trim() &&
        description.trim() &&
        field.trim()
    );
  };

  useEffect(() => {
    validateForm();
  }, [brandName, positioning, description, field]);

  const handleGenerateScript = async () => {
    setLoading(true);
    setResult(""); // Reset lại kết quả trước khi tạo mới
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      const prompt = `Viết bài giới thiệu doanh nghiệp cho thương hiệu "${brandName}" thuộc lĩnh vực "${field}". Định vị tập trung: "${positioning}". Một số ý chính: "${description}". Bài viết cần chuyên nghiệp, hấp dẫn và rõ ràng.`;

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
        setResult((prev) => prev + data); // Gộp kết quả trả về
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
      console.error("Error generating script:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Bài giới thiệu trên website</h1>
      <p className={cx("subtitle")}>
        Bài giới thiệu phù hợp đăng lên website. Viết cho doanh nghiệp hoặc
        thương hiệu cá nhân
      </p>

      <div className={cx("form")}>
        {/* AI Model */}
        <div>
          <ModelAI
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
          
        </div>

        <div className={cx("formGroup")}>
          <label htmlFor="kieubai">Kiểu bài giới thiệu</label>
          <select
            id="kieubai"
            className={cx("select")}
            value={positioning}
            onChange={(e) => setPositioning(e.target.value)}
          >
            <option value="Giới thiệu doanh nghiệp">
              Giới thiệu doanh nghiệp
            </option>
            <option value="Giới thiệu thương hiệu cá nhân">
              Giới thiệu thương hiệu cá nhân
            </option>
          </select>
        </div>
        {/* Brand Name */}
        <div className={cx("formGroup")}>
          <label htmlFor="brandName">Tên thương hiệu</label>
          <input
            id="brandName"
            type="text"
            className={cx("input")}
            placeholder="Nhập tên thương hiệu"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
        </div>

        {/* Field */}
        <div className={cx("formGroup")}>
          <label htmlFor="field">Lĩnh vực</label>
          <input
            id="field"
            type="text"
            className={cx("input")}
            placeholder="Nhập lĩnh vực hoạt động"
            value={field}
            onChange={(e) => setField(e.target.value)}
          />
          <small className={cx("smallstyle")}>
            Định vị của bạn tập trung vào lĩnh vực nào?
          </small>
        </div>

        {/* Description */}
        <div className={cx("formGroup")}>
          <label htmlFor="description">Mô tả vài ý chính</label>
          <textarea
            id="description"
            className={cx("textarea")}
            placeholder="Ví dụ: lĩnh vực hoạt động, giá trị mang lại, tầm nhìn & sứ mệnh..."
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <small className={cx("smallstyle")}>
            Các lĩnh vực hoạt động, giá trị mang lại cho đối tượng khách hàng,
            tầm nhìn & sứ mệnh, điểm khác biệt độc đáo ....
          </small>
        </div>

        {/* Button */}
        <button
          className={cx("button")}
          onClick={handleGenerateScript}
          disabled={!isFormValid || loading}
        >
          {loading ? "Đang tạo bài viết..." : "Tạo bài viết"}
        </button>
      </div>

      {/* Kết quả */}
      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default BusinessIntroductionArticle;
