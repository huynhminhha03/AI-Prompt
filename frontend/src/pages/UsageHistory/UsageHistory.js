import React, { useState, useContext, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./UsageHistory.module.scss";
import { adminApis, authAPI, userApis } from "~/utils/api";
import { useNavigate } from "react-router-dom";
import UserContext from "~/context/UserContext";
import Spinner from "~/components/Spinner";
import { useLocation } from "react-router-dom";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";

const cx = classNames.bind(styles);

const UsageHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [usagehistory, setUsagehistory] = useState([]);
  const { user } = useContext(UserContext);
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page")) || 1;

  const [activePage, setActivePage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);

  const handlePageClick = (pageNumber) => {
    setActivePage(pageNumber);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); 
        const result = await authAPI().get(userApis.getUsageHistory, {
          params: { page: activePage },
        });
        setUsagehistory(result.data.tokenUsages);
        console.log("Usage history: ", result.data);
        setTotalPages(result.data.totalPages);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }


    };

    fetchData();
  }, [activePage]);

  return (
    <div className={cx("pay-container")}>
      <h1 className={cx("title")}>
        <i className="fas fa-history"></i>
        Lịch sử sử dụng</h1>
      {loading ? (
        <div>
          Đang tải...
        </div>
      ) : (
        <table className={cx("user-table")}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Người dùng</th>
              <th>Conversation ID</th>
              <th>Bot ID</th>
              <th>Ngày sử dụng</th>
              <th>Lịch sử trừ cộng</th>
            </tr>
          </thead>
          <tbody>
            {usagehistory.map((history, index) => (
              <tr key={index}>
                <td>{index + 1 + (activePage - 1) * 10}</td>
                <td>{history.user_id}</td>
                <td>{history.conversation_id}</td>
                <td>{history.bot_id}</td>
                <td>{new Date(history.usage_date).toLocaleDateString()}</td>
                <td className={cx("total")}>
                  {(
                    (history.input_count || 0) * (history.input_rate || 0) +
                    (history.output_count || 0) * (history.output_rate || 0)
                  ).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className={cx("page-wrapper")}>
        <div className={cx("page-container")}>
          <div
            className={cx("page", { disabled: activePage === 1 })}
            onClick={() => activePage > 1 && handlePageClick(activePage - 1)}
          >
            <PrevPageIcon />
          </div>
          {[...Array(totalPages)].map((_, pageNumber) => (
            <div
              key={pageNumber + 1}
              className={cx("page", {
                active: activePage === pageNumber + 1,
              })}
              onClick={() => handlePageClick(pageNumber + 1)}
            >
              {pageNumber + 1}
            </div>
          ))}
          <div
            className={cx("page", { disabled: activePage === totalPages })}
            onClick={() =>
              activePage < totalPages && handlePageClick(activePage + 1)
            }
          >
            <NextPageIcon />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageHistory;
