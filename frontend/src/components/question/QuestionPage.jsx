import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QnaList from './QnaList';
import QnaCenter from './QnaCenter';
import QnaWrite from './QnaWrite';
import "../../assets/css/question.css";
import { getQnaApi } from "../../assets/js/api/QuestionApi";

const QuestionPage = ({productId,store}) => {//문의 메인 페이지

    const [qnaList,setQnaList] = useState([])
    const [showWriteModal,setShowWriteModal] = useState(false)
    const navigate = useNavigate()

    const [filter,setFilter] = useState({
        hidePrivate: false,
        onlyMine: false,
        status: 'all',
        qnaCategory: 'all',
    })
    const handleOpenWrite = () => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            alert("로그인이 필요한 서비스입니다.");
            return window.location.replace("/login");
        }

        setShowWriteModal(true);
        };

    const loadData = async () => {
    try {
        const categoryParam =
          filter.qnaCategory === 'all' ? null : filter.qnaCategory;

        const res = await getQnaApi(productId, categoryParam); 
        setQnaList(res.data); 
    } catch (err) {
        console.error("❌ QnA 조회 실패:", err);
    }
};
    const refreshQnaList = async () => {
    try {
        const categoryParam =
        filter.qnaCategory === 'all' ? null : filter.qnaCategory;

        const res = await getQnaApi(productId, categoryParam);
        setQnaList(res.data);
    } catch (err) {
        console.error("❌ QnA 새로고침 실패:", err);
    }
    };


    useEffect(() => {
    loadData();
    }, [productId,filter.qnaCategory]);

    return (
        <div className='qna-wrapper'>
            <h2 className='qna-title'>Q & A</h2>
            <p className='qna-sub'>
                상품에 대해 궁금한 점이 있으신 경우 문의해주세요.
                <span className='link' onClick={()=> navigate(`/store/${store.producerId}/question`)}> 판매자 문의</span>를 통해 1:1상담도 가능합니다.
            </p>

            <div className='qna-action-box'>
                <button className='btn-primary' onClick={handleOpenWrite}>
                    상품 Q&A 작성하기
                </button>

                <div className='qna-filters'>
                    <label className='filter-item'>
                        <input type='checkbox' checked={filter.hidePrivate} onChange={()=> setFilter(prev => ({...prev, hidePrivate: !prev.hidePrivate}))}/>
                        비밀글 제외</label>

                <select className='filter-select' value={filter.qnaCategory} onChange={(e)=>setFilter(prev => ({...prev,qnaCategory:e.target.value}))}>
                    <option value='all'>전체 문의</option>
                    <option value='상품문의'>상품문의</option>
                    <option value='배송문의'>배송문의</option>
                    <option value='환불/교환문의'>환불/교환문의</option>
                    <option value='주문/결제문의'>주문/결제문의</option>
                    <option value='포장문의'>포장문의</option>
                    <option value='기타문의'>기타문의</option>
                </select>

                <select className='filter-select' value={filter.status} onChange={(e)=>setFilter(prev => ({...prev,status:e.target.value}))}>
                    <option value='all'>전체</option>
                    <option value='WAITING'>미답변</option>
                    <option value='ANSWERED'>답변완료</option>
                </select>
                </div>
            </div>

            <QnaList qnaList={qnaList} refreshQnaList={refreshQnaList}/>
            <QnaCenter/>
            {showWriteModal && (
                <QnaWrite
                    productId={productId}
                    storeId={store.storeId}
                    onClose={() => setShowWriteModal(false)} refreshQnaList={refreshQnaList}
                />
                )}
        </div>
    );
};

export default QuestionPage;