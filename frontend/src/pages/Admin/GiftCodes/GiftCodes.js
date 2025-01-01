import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { useLocation } from "react-router-dom";
import styles from "./GiftCodes.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import Button from "~/components/Button";
import CreateGiftCode from "./CreateGiftCode";
import Modal from "~/components/Modal";
import DeleteModal from "~/components/DeleteModal";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
const cx = classNames.bind(styles);

function GiftCodes() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page")) || 1;

  const [activePage, setActivePage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [giftCodes, setGiftCodes] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGiftCode, setSelectedGiftCode] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "code",
    direction: "asc",
  });

  const handlePageClick = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortGiftCodes = (giftCodes) => {
    const { key, direction } = sortConfig;
    return giftCodes.sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleEditClick = (id) => {
    setEditRow(id);
    const row = giftCodes.find((code) => code.id === id);
    setEditValues({
      code: row.code || "",
      amount: row.amount || 0,
    });
  };

  const handleCancelEdit = () => {
    setEditRow(null);
    setEditValues({});
  };

  const handleDeleteClick = (id) => {
    const giftCode = giftCodes.find((code) => code.id === id);
    setSelectedGiftCode(giftCode);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedGiftCode) return;

    try {
      await authAPI().delete(adminApis.deleteGiftCode(selectedGiftCode.id));
      setReload(!reload);
      setShowDeleteModal(false);
      setSelectedGiftCode(null);
    } catch (error) {
      console.error("Error deleting gift code:", error);
    }
  };

  const handleInputChange = (field) => (e) => {
    setEditValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleUpdate = async (id) => {
    try {
      await authAPI().patch(adminApis.updateGiftCode(id), editValues);
      setGiftCodes((prevData) =>
        prevData.map((code) =>
          code.id === id
            ? {
                ...code,
                code: editValues.code,
                amount: editValues.amount,
              }
            : code
        )
      );
      setEditRow(null);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await authAPI().get(adminApis.getAllGiftCodes, {
          params: {
            page: activePage,
          },
        });
        setGiftCodes(result.data.giftCodes);
        setTotalPages(result.data.totalPages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [reload, activePage]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <i
            className="fa fa-gift"
            style={{
              fontSize: "2.5rem",
              color: "var(--primary-color)",
              marginRight: "8px"
            }}
            aria-hidden="true"
          ></i>{" "}
          {/* #195a97 */}
          <h1 className={cx("icon-h1")}>Thẻ quà tặng</h1>
        </div>

        <Button primary onClick={() => setIsModalOpen(true)}>
          Tạo mã quà tặng
        </Button>
      </div>
      <table className={cx("user-table")}>
        <thead>
          <tr>
            <th onClick={() => handleSort("code")}>Mã</th>
            <th onClick={() => handleSort("amount")}>Số lượng</th>
            <th>ID người dùng</th>
            <th>Đã sử dụng</th>
            <th>Thời gian sử dụng</th>
            <th>Thời gian tạo</th>
            <th>Ngày hết hạn</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {giftCodes.length > 0 ? (
            giftCodes.map((code) => (
              <tr key={code?.id}>
                <td>
                  {editRow === code.id ? (
                    <input
                      type="text"
                      value={editValues.code}
                      onChange={handleInputChange("code")}
                    />
                  ) : (
                    code?.code || "null"
                  )}
                </td>
                <td>
                  {editRow === code.id ? (
                    <input
                      type="number"
                      value={editValues.amount}
                      onChange={handleInputChange("amount")}
                    />
                  ) : (
                    code?.amount || "null"
                  )}
                </td>
                <td>{code?.user_id || "N/A"}</td>
                <td>{code?.is_used ? "Yes" : "No"}</td>

                <td>
                  {code?.used_at
                    ? new Date(code?.used_at).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "N/A"}
                </td>
                <td>
                  {code?.created_at
                    ? new Date(code?.created_at).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "N/A"}
                </td>
                <td>
                  {code?.expired_at
                    ? new Date(code?.expired_at).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "N/A"}
                </td>

                <td className="d-flex justify-content-center align-items-center">
                  {editRow === code?.id ? (
                    <>
                      <Button primary onClick={() => handleUpdate(code?.id)}>
                        <i
                          className=" fa-solid fa-check
                        "
                        ></i>
                      </Button>
                      <Button outline onClick={handleCancelEdit}>
                        <i className=" fa-solid fa-x "></i>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        disabled={code?.is_used}
                        outline
                        onClick={() => handleEditClick(code.id)}
                      >
                        <i className=" fa-solid fa-pen-to-square "></i>
                      </Button>
                      <Button
                        primary
                        disabled={code?.is_used}
                        onClick={() => handleDeleteClick(code.id)}
                      >
                        <i className=" fa-solid fa-trash-alt "></i>
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
              className={cx("page", { active: activePage === pageNumber + 1 })}
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
          {isModalOpen && (
            <Modal isAdmin onClose={() => setIsModalOpen(false)}>
              <CreateGiftCode setReload={setReload} reload={reload} />
            </Modal>
          )}
          {showDeleteModal && (
            <DeleteModal
              title="Xác nhận Xóa"
              onClose={() => setShowDeleteModal(false)}
              onConfirm={confirmDelete}
            >
              Bạn có chắc chắn muốn xóa mã quà tặng với mã{" "}
              <strong>{selectedGiftCode?.code}</strong> không?
            </DeleteModal>
          )}
        </div>
      </div>
    </div>
  );
}

export default GiftCodes;
