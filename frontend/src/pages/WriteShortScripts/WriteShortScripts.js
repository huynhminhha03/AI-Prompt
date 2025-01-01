import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./WriteShortScripts.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";

const cx = classNames.bind(styles);

const WriteShortScripts = () => {
  const [product, setProduct] = useState("");
  const { setModalType } = useContext(ModalTypeContext);
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("Chuyên nghiệp");
  const [selectedModel, setSelectedModel] = useState("");
  //   const [result, setResult] = useState(`# Dịch Vụ Thiết Kế Website Chuyên Nghiệp

  // ## Giới Thiệu Dịch Vụ Thiết Kế Website Chuyên Nghiệp

  // Trong thời đại số hóa hiện nay, việc sở hữu một trang web chuyên nghiệp không chỉ là xu hướng mà còn là nhu cầu thiết yếu đối với mọi doanh nghiệp. Dịch vụ thiết kế website chuyên nghiệp giúp doanh nghiệp xây dựng một nền tảng trực tuyến mạnh mẽ, tạo ấn tượng tốt với khách hàng và nâng cao uy tín thương hiệu.

  // ## Thiết Kế Website Chuẩn SEO

  // ### Tối Ưu Hóa Công Cụ Tìm Kiếm

  // Thiết kế website chuẩn SEO là yếu tố quan trọng giúp trang web của bạn dễ dàng xuất hiện trên các công cụ tìm kiếm như Google, Bing. Việc tối ưu hóa SEO bao gồm việc sử dụng từ khóa hợp lý, tối ưu hóa hình ảnh, xây dựng liên kết nội bộ và bên ngoài, đảm bảo nội dung chất lượng và thường xuyên cập nhật.

  // ### Tăng Lượng Truy Cập Tự Nhiên

  // Một trang web được thiết kế chuẩn SEO sẽ giúp tăng lượng truy cập tự nhiên từ các công cụ tìm kiếm. Điều này không chỉ giúp tiết kiệm chi phí quảng cáo mà còn mang lại lượng khách hàng tiềm năng chất lượng cao.

  // ## Giao Diện Hiện Đại

  // ### Thiết Kế Đẹp Mắt Và Chuyên Nghiệp

  // Giao diện hiện đại là yếu tố không thể thiếu trong một trang web chuyên nghiệp. Một thiết kế đẹp mắt, tinh gọn và dễ hiểu sẽ giúp thu hút và giữ chân khách hàng. Màu sắc hài hòa, bố cục hợp lý và hình ảnh chất lượng cao là những yếu tố cần thiết để tạo nên một giao diện hiện đại.

  // ### Tương Thích Với Mọi Thiết Bị

  // Trang web của bạn cần phải tương thích với mọi thiết bị từ máy tính, máy tính bảng đến điện thoại di động. Điều này không chỉ giúp cải thiện trải nghiệm người dùng mà còn ảnh hưởng đến thứ hạng SEO của trang web.

  // ## Tốc Độ Tải Trang Nhanh

  // ### Tối Ưu Hóa Tốc Độ Tải Trang

  // Tốc độ tải trang nhanh là một trong những yếu tố quan trọng ảnh hưởng đến trải nghiệm người dùng và thứ hạng SEO. Một trang web tải nhanh sẽ giảm tỷ lệ thoát trang, giữ chân khách hàng lâu hơn và cải thiện khả năng chuyển đổi.

  // ### Sử Dụng Công Nghệ Tiên Tiến

  // Các công nghệ tiên tiến như nén hình ảnh, sử dụng CDN, tối ưu hóa mã nguồn và lưu trữ đám mây sẽ giúp cải thiện tốc độ tải trang. Đảm bảo trang web của bạn luôn hoạt động mượt mà và nhanh chóng.

  // ## Kết Luận

  // Dịch vụ thiết kế website chuyên nghiệp không chỉ giúp bạn xây dựng một trang web đẹp mắt, chuẩn SEO mà còn cải thiện tốc độ tải trang và trải nghiệm người dùng. Đầu tư vào một trang web chuyên nghiệp là bước đi đúng đắn để nâng cao uy tín thương hiệu và thu hút khách hàng tiềm năng.

  // Hãy liên hệ với chúng tôi để được tư vấn và thiết kế một trang web chuyên nghiệp, hiện đại và tối ưu hóa SEO ngay hôm nay! `);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false); // Trạng thái hợp lệ của form

  // Hàm kiểm tra tính hợp lệ của biểu mẫu
  const validateForm = () => {
    setIsFormValid(product.trim() && description.trim());
  };

  // Gọi kiểm tra mỗi khi một trường thay đổi
  useEffect(() => {
    validateForm();
  }, [product, description]);

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
      const prompt = `Viết kịch bản video ngắn cho sản phẩm "${product}" với phong cách "${style}". Mô tả chi tiết: "${description}". Kịch bản cần ngắn gọn, hấp dẫn, và phù hợp với quảng cáo ngắn.`;

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
      console.error("Error generating script:", error);
      setLoading(false);
    }
  };

  return (
    <div className={cx("container")}>
      <h1 className={cx("title")}>Viết kịch bản video ngắn</h1>
      <p className={cx("subtitle")}>
        Giúp bạn tạo các kịch bản video ngắn nhanh chóng và dễ dàng
      </p>

      {/* Form */}
      <div className={cx("form")}>
        {/* Model Selection */}
        <div>
          <ModelAI
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
          
        </div>

        {/* Product */}
        <div className={cx("formGroup")}>
          <label htmlFor="product">Sản phẩm quảng cáo</label>
          <input
            id="product"
            type="text"
            className={cx("input")}
            placeholder="Nhập tên sản phẩm"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className={cx("formGroup")}>
          <label htmlFor="description">Mô tả</label>
          <textarea
            id="description"
            className={cx("textarea")}
            placeholder="Chi tiết sản phẩm hoặc ý tưởng chính video"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Style */}
        <div className={cx("formGroup")}>
          <label htmlFor="styleSelect">Phong cách video</label>
          <select
            id="styleSelect"
            className={cx("select")}
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            <option value="Chuyên nghiệp">Chuyên nghiệp</option>
            <option value="Hài hước">Hài hước</option>
            <option value="Cảm hứng">Cảm hứng</option>
          </select>
        </div>

        {/* Button */}
        <button
          className={cx("button")}
          onClick={handleGenerateScript}
          disabled={!isFormValid || loading}
        >
          {loading ? "Đang tạo kịch bản..." : "Tạo kịch bản"}
        </button>
      </div>

      <ResultPrompt content={result} loading={loading} />
    </div>
  );
};

export default WriteShortScripts;
