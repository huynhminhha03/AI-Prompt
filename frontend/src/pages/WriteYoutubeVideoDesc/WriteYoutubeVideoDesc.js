import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./WriteYoutubeVideoDesc.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const WriteYoutubeVideoDesc = () => {
  const [selectedModel, setSelectedModel] = useState("");
  const [keywords, setKeywords] = useState(""); // Keywords for the video
  const [productIntro, setProductIntro] = useState("Không giới thiệu");
  const [videoContent, setVideoContent] = useState(""); // Video content
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false); // Form validity status
  const { setModalType } = useContext(ModalTypeContext);
  const [productIntros, setProductIntros] = useState(""); // Product introduction

  // Form validation function
  const validateForm = () => {
    const isValid =
      keywords.trim() !== "" &&
      videoContent.trim() !== "" &&
      productIntro.trim() !== "" &&
      (productIntro === "Không giới thiệu" ||
        (productIntro === "Sản phẩm cần giới thiệu" &&
          productIntros.trim() !== ""));
    setIsFormValid(isValid);
  };

  // Trigger validation on input changes
  useEffect(() => {
    validateForm();
  }, [keywords, videoContent, productIntro, productIntros]);

  // Script generation function
  const handleGenerateScript = async () => {
    if (!isFormValid) {
      return;
    }

    setLoading(true);
    setResult(""); // Reset previous result
    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      return;
    }
    try {
      const prompt = `
        Viết một mô tả video YouTube tối ưu SEO. Các yêu cầu cụ thể như sau:
        - Từ khóa chính: "${keywords}" (nên xuất hiện tự nhiên trong tiêu đề và mô tả).
        - Phong cách mô tả: "Chuyên nghiệp".
        - Giới thiệu sản phẩm: "${productIntro}" ${
          productIntro === "Sản phẩm cần giới thiệu"
            ? `(Tên sản phẩm: "${productIntros}")`
            : ""
        }.
        - Nội dung video: "${videoContent}" (tóm tắt ngắn gọn).

        Hãy viết mô tả hấp dẫn, thân thiện với SEO, và khuyến khích người xem tương tác (thích, bình luận, chia sẻ).
      `;

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
        setResult((prev) => prev + data); // Append new data to result
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
      <h1 className={cx("title")}>Viết mô tả video YouTube chuẩn SEO</h1>
      <p className={cx("subtitle")}>
        Giúp bạn tạo tiêu đề và mô tả video khi đăng lên YouTube
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

        {/* Keywords */}
        <div className={cx("formGroup")}>
          <label htmlFor="keywords">Từ khóa</label>
          <input
            id="keywords"
            type="text"
            className={cx("input")}
            placeholder="Nhập từ khóa"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        {/* Product Introduction */}
        <div className={cx("formGroup")}>
          <label htmlFor="productIntro">
            Có giới thiệu sản phẩm trong mô tả?
          </label>
          <select
            id="productIntro"
            className={cx("select")}
            value={productIntro}
            onChange={(e) => setProductIntro(e.target.value)}
          >
            <option value="Không giới thiệu">Không giới thiệu</option>
            <option value="Sản phẩm cần giới thiệu">
              Sản phẩm cần giới thiệu
            </option>
          </select>
        </div>

        {/* Product Details */}
        {productIntro === "Sản phẩm cần giới thiệu" && (
          <div className={cx("formGroup")}>
            <label htmlFor="productIntros">Sản phẩm cần giới thiệu</label>
            <input
              id="productIntros"
              type="text"
              className={cx("input")}
              placeholder="Nhập tên sản phẩm"
              value={productIntros}
              onChange={(e) => setProductIntros(e.target.value)}
            />
          </div>
        )}

        {/* Video Content */}
        <div className={cx("formGroup")}>
          <label htmlFor="videoContent">Nội dung video</label>
          <textarea
            id="videoContent"
            className={cx("textarea")}
            placeholder="Tóm tắt nội dung video"
            rows="4"
            value={videoContent}
            onChange={(e) => setVideoContent(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          className={cx("button")}
          onClick={handleGenerateScript}
          disabled={!isFormValid || loading}
        >
          {loading ? "Đang viết..." : "Viết mô tả video"}
        </button>
      </div>

      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default WriteYoutubeVideoDesc;
