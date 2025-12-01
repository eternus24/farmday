import React, { useContext, useEffect, useState } from 'react';
import { getStoreList, writeAnswer } from '../../assets/js/api/QuestionApi';
import '../../assets/css/storeDetail.css';
import { useLocation, useParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { getStoreInfo } from '../../assets/js/api/ShopApi';

const StoreQuestion = () => {//문의 관리

  const { auth } = useContext(AuthContext)
  const [store, setStore] = useState(null)
  const { pathname } = useLocation();
  const { producerId } = useParams();

  const loginUser = auth?.name;
  const storeOwner = store?.userId;
  const isOwner = loginUser === storeOwner;
  const [showModal, setShowModal] = useState(false); //답변작성 모달창

  const [filters, setFilters] = useState({
    qnaCategory: 'all',
    status: 'all',
    keyword: '',
  });

  //리스트 상태
  const [qnaList, setQnaList] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  //상세 답변
  const [selectedQna, setSelectedQna] = useState(null);
  const [answerText, setAnswerText] = useState("");

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await getStoreInfo(producerId);//비동기처리
        setStore(res);
      } catch (err) {
        console.error("스토어 정보 조회 실패", err);
      }
    };

    fetchStore();
  }, [producerId]);

  //문의 리스트 조회
  const fetchQnaList = async () => {
    if (!store || !store.storeId) return;

    try {
      setLoading(true);

      const res = await getStoreList({
        storeId: store.storeId,
        qnaCategory: filters.qnaCategory === "all" ? null : filters.qnaCategory,
        status: filters.status === "all" ? null : filters.status,
        keyword: filters.keyword || null,
      });

      const list = res.data?.content;
      const total = res.data?.totalElements;

      setQnaList(Array.isArray(list) ? list : []);
      setTotalCount(typeof total === "number" ? total : 0);
    } catch (err) {
      console.error("문의 리스트 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQnaList();
  }, [filters, page, producerId, store]);

  //필터 변경 
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  }

  // 리스트 행 클릭
  const handleRowClick = (qna) => {
    setSelectedQna(qna);
    setAnswerText(qna.answerContent || "");
    setShowModal(true)
  }

  //답변 등록
  const handleAnswerSubmit = async () => {
    if (!selectedQna) return
    if (!window.confirm("답변을 등록하시겠습니까?")) return;

    try {
      await writeAnswer(selectedQna.qnaId, {
        answerContent: answerText,
      })
      alert("답변이 등록되었습니다.");
      fetchQnaList();
    } catch (err) {
      alert("답변 등록 실패");
      console.error(err)
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className='store-qna-container'>

      {/* 필터 영역 */}
      <div className='store-qna-filter-bar'>
        <select value={filters.qnaCategory} onChange={(e) => handleFilterChange('qnaCategory', e.target.value)}>
          <option value="all">전체 문의</option>
          <option value="상품문의">상품문의</option>
          <option value="배송문의">배송문의</option>
          <option value="환불/교환문의">환불/교환문의</option>
          <option value="주문/결제문의">주문/결제문의</option>
          <option value="포장문의">포장문의</option>
          <option value="기타문의">기타문의</option>
        </select>

        <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
          <option value="all">전체 상태</option>
          <option value="WAITING">미답변</option>
          <option value="ANSWERED">답변 완료</option>
        </select>

        <div className='search-box'>
          <input type='text' value={filters.keyword} placeholder='검색어를 입력하세요'
            onChange={(e) => handleFilterChange('keyword', e.target.value)} />
          <button onClick={() => fetchQnaList()}>검색</button>
        </div>
      </div>

      {/* 리스트 영역만 (오른쪽 패널 삭제됨) */}
      <div className='qna-table-area-only'>
        <table className='qna-table'>
          <thead>
            <tr>
              <th style={{ width: "80px" }}>상태</th>
              <th style={{ width: "120px" }}>카테고리</th>
              <th className="qna-title-col">제목</th>
              <th style={{ width: "120px" }}>작성자</th>
              <th style={{ width: "120px" }}>작성일</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className='text-center'>로딩중...</td>
              </tr>
            )}

            {!loading && qnaList.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center">
                  해당 조건의 문의 없음
                </td>
              </tr>
            )}

            {!loading &&
              qnaList.map((q) => (
                <tr key={q.qnaId}
                  className={selectedQna?.qnaId === q.qnaId ? "row-selected" : ""}
                  onClick={() => handleRowClick(q)}
                >
                  <td>
                    <span className={
                      q.status === "ANSWERED"
                        ? "badge answered"
                        : "badge waiting"
                    }>
                      {q.status === "ANSWERED" ? "완료" : "대기"}
                    </span>
                  </td>

                  <td>{q.qnaCategory}</td>
                  <td className="qna-title-cell">{q.title}</td>
                  <td>{q.writerUserId?.replace(/(?<=.{2})./g, "*")}</td>
                  <td>{q.createdDate?.slice(0, 10)}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* 페이징 */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            ◀
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} >
            ▶
          </button>
        </div>
      </div>

      {/* 모달 */}
      {showModal && selectedQna && (
        <div className="qna-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="qna-modal" onClick={(e) => e.stopPropagation()}>

            {/* 닫기 버튼 추가 */}
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>

            <h3>{selectedQna.title}</h3>

            <div className="modal-section">
              <p><strong>문의 내용</strong></p>
              <div className="qna-modal-text">{selectedQna.content}</div>
            </div>

            <div className="modal-section">
              <p><strong>답변 작성</strong></p>

              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="고객에게 전달할 답변을 입력하세요."
              />

              <button className="btn-submit" onClick={handleAnswerSubmit}>
                답변 등록 / 수정
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StoreQuestion;