import React from 'react';
import "../../assets/css/question.css";

const QnaCenter = () => {//고객센터
    return (
        <div className='qna-center'>
            <h3>고객센터</h3>

            <div className='center-box'>
                <div>
                    <strong>📞 전화 문의 1234-1234</strong>
                    <p>월~토요일 오전 7시 ~ 오후 6시</p>
                </div>

                <div>
                    <strong>💬 카카오톡 문의</strong>
                    <p>월-토요일 오전 7시 - 오후 6시</p>
                </div>

                <div>
                    <strong>📝 홈페이지 문의</strong>
                    <p>로그인 - 마이페이지  1:1 문의</p>
                </div>

            </div>
            
        </div>
    );
};

export default QnaCenter;