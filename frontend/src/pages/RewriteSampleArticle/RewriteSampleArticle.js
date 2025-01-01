import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./RewriteSampleArticle.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const RewriteSampleArticle = () => {
  const { setModalType } = useContext(ModalTypeContext);

  const [model, setModel] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [platform, setPlatform] = useState("TMĐT (vd Shopee)");
  const [customFlatform, setCustomFlatform] = useState("");
  const [language, setLanguage] = useState("Tiếng Việt");
  const [sampleContent, setSampleContent] = useState("");
  const [mimicType, setMimicType] = useState("Văn phong");
  const [otherRequest, setOtherRequest] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const handleGenerateContent = async () => {
    setLoading(true);
    setResult(""); // Reset previous result
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      // Prompt creation
      const formattedPlatform = platform === "Khác" ? customFlatform : platform;
      const otherRequests =
        otherRequest === "Yêu cầu Khác" ? customFlatform : platform;
      const prompt = `Viết lại nội dung: "${originalContent}"\nNền tảng đăng bài: "${formattedPlatform}"\nNgôn ngữ: "${language}"\nBài mẫu để học: "${sampleContent}"\nBắt chước: "${otherRequests}"`;
      // Connect to server using SSE
      const eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(
          prompt
        )}&model=${encodeURIComponent(selectedModel)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setResult((prev) => prev + data);
      };

      eventSource.onerror = () => {
        eventSource.close();
        setLoading(false);
      };

      eventSource.onclose = () => {
        setLoading(false);
      };
    } catch (error) {
      console.error("Error generating content:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Viết lại theo bài mẫu</h1>
      <p className={cx("subtitle")}>
        Cung cấp bài mẫu để viết lại cho mọi nền tảng
      </p>

      <div className={cx("form")}>
        <div>
          <ModelAI
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>
        {/* Original Content */}
        <div className={cx("formGroup")}>
          <label htmlFor="originalContent">Nội dung gốc</label>
          <textarea
            id="originalContent"
            className={cx("textarea")}
            placeholder="Nhập nội dung bài viết gốc"
            rows="4"
            value={originalContent}
            onChange={(e) => setOriginalContent(e.target.value)}
          />
        </div>

        {/* Platform */}
        <div className={cx("formGroup")}>
          <label htmlFor="platform">Nền tảng đăng bài mới</label>
          <select
            id="platform"
            className={cx("select")}
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="TMĐT (vd Shopee)">
              Phù hợp sàn TMĐT (vd Shopee)
            </option>
            <option value="Website">Phù hợp website bán hàng</option>
            <option value="Mạng xã hội (vd Facebook)">
              Phù hợp mạng xã hội (vd Facebook)
            </option>
            <option value="Mạng xã hội (vd Facebook)">
              Phù hợp bài chia sẻ trên web (vd bài SEO)
            </option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        {platform === "Khác" && (
          <div className={cx("formGroup")}>
            <label htmlFor="platform">Nhập nền tảng khác</label>
            <input
              type="text"
              className={cx("input")}
              placeholder="Nhập nền tảng khác"
              value={customFlatform}
              onChange={(e) => setCustomFlatform(e.target.value)}
            />
          </div>
        )}

        {/* Language */}
        <div className={cx("formGroup")}>
          <label htmlFor="language">Ngôn ngữ</label>
          <input
            id="language"
            className={cx("input")}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          ></input>
        </div>

        {/* Sample Content */}
        <div className={cx("formGroup")}>
          <label htmlFor="sampleContent">Bài mẫu</label>
          <textarea
            id="sampleContent"
            className={cx("textarea")}
            placeholder="Nhập bài mẫu để AI học và viết lại"
            rows="4"
            value={sampleContent}
            onChange={(e) => setSampleContent(e.target.value)}
          />
        </div>

        {/* Mimic Type */}
        <div className={cx("formGroup")}>
          <label htmlFor="mimicType">Bắt chước cái gì từ bài mẫu?</label>
          <select
            id="mimicType"
            className={cx("select")}
            value={mimicType}
            onChange={(e) => setMimicType(e.target.value)}
          >
            <option value="Văn phong">Bắt chước văn phong</option>
            <option value="Văn phong và cấu trúc">
              Bắt chước văn phong và cấu trúc
            </option>
            <option value="Yêu cầu khác">Yêu cầu khác</option>
          </select>
        </div>

        {/* Other Request */}
        {mimicType === "Yêu cầu khác" && (
          <div className={cx("formGroup")}>
            <label htmlFor="otherRequest">Yêu cầu khác</label>
            <textarea
              id="otherRequest"
              className={cx("textarea")}
              placeholder="Bắt chước thế nào? Nhập yêu cầu khác (nếu có)"
              rows="3"
              value={otherRequest}
              onChange={(e) => setOtherRequest(e.target.value)}
            />
          </div>
        )}

        {/* Generate Button */}
        <button
          className={cx("button")}
          onClick={handleGenerateContent}
          disabled={!originalContent || !platform || loading}
        >
          {loading ? "Đang viết lại..." : "Viết lại"}
        </button>
      </div>

      {/* Result */}
      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default RewriteSampleArticle;
