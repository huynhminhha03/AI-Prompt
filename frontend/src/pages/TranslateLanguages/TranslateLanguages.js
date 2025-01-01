import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./TranslateLanguages.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import useAgeServices from "~/services/useAgeServices";
import ModelAI from "~/components/ModelAI";
import Select from "react-select";

const cx = classNames.bind(styles);

const TranslateLanguages = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const { languages: fetchedLanguages } = await useAgeServices.getLanguages();
        setLanguages(fetchedLanguages);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };
    fetchLanguages();
  }, []);

  const handleTranslate = async () => {
    if (!localStorage.getItem("token")) {
      setModalType("loginEmail");
      return;
    }

    setLoading(true);
    setOutputText("");
    try {
      const prompt = `Dịch sang ${selectedLanguage}: ${inputText}`;
      const eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(selectedModel)}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      eventSource.onmessage = (event) => {
        setOutputText((prev) => prev + JSON.parse(event.data));
      };

      eventSource.onerror = () => {
        eventSource.close();
        setLoading(false);
      };

      eventSource.onclose = () => {
        setLoading(false);
      };
    } catch (error) {
      console.error("Error translating content:", error);
      setOutputText("Đã xảy ra lỗi khi dịch nội dung.");
      setLoading(false);
    }
  };

  return (
    <div className={cx("translateContainer")}>
      <h1 className={cx("header")}>Dịch nội dung</h1>
      <p className={cx("description")}>Dịch bài viết hoặc nội dung dễ dàng và tự nhiên.</p>

      <div className={cx("form")}>
        <ModelAI selectedModel={selectedModel} setSelectedModel={setSelectedModel} />

          <label htmlFor="languageSelect">Dịch sang</label>
          <Select
            id="languageSelect"
            className={cx("formGroup")}
            options={languages.map((lang) => ({ value: lang, label: lang }))}
            value={{ value: selectedLanguage, label: selectedLanguage }}
            onChange={(option) => setSelectedLanguage(option.value)}
            placeholder="Chọn ngôn ngữ..."
            isSearchable
          />

        <div className={cx("formGroup")}>
          <label htmlFor="inputText">Nội dung cần dịch</label>
          <textarea
            id="inputText"
            className={cx("textarea")}
            rows="6"
            placeholder="Nhập tối đa 5000 ký tự"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <button
          className={cx("button")}
          onClick={handleTranslate}
          disabled={loading || !inputText || !selectedLanguage}
        >
          {loading ? "Đang dịch..." : "Dịch"}
        </button>
      </div>

      <ResultPrompt content={outputText} loading={loading} />
    </div>
  );
};

export default TranslateLanguages;
