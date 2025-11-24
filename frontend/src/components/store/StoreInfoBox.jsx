import React from 'react';

const StoreInfoBox = () => {//스토어 정보 박스(정책/연락처 등)
    return (
    <div className="py-3 small">

      <p className="mb-2 fw-semibold">※ 배송 안내</p>
      <ul className="mb-3 ps-3">
        <li className="mb-1">
          본 사이트의 모든 상품은 산지 또는 지정 물류센터에서
          <strong> 신선 농산물 전용 택배</strong>로 발송됩니다.
        </li>
        <li className="mb-1">
          주문 확인 후 보통 <strong>1~2영업일 이내 출고</strong>되며,
          수확 일정·기상 상황·택배사 사정에 따라 출고일이 변경될 수 있습니다.
        </li>
        <li className="mb-1">
          일부 산지 직송 상품의 경우 생산자 일정에 따라
          <strong> 개별 발송</strong>되며, 동일 주문 내 상품이 여러 박스로 나누어 도착할 수 있습니다.
        </li>
        <li className="mb-1">
          특정 날짜 수령을 원하시는 경우, 주문 전 고객센터로 가능 여부를 문의해 주세요.
        </li>
      </ul>
      <br/>
      <p className="mb-2 fw-semibold">※ 교환/반품 안내</p>
      <p className="mb-1 fw-semibold">01. 상품에 문제가 있는 경우</p>
      <ul className="mb-3 ps-3">
        <li className="mb-1">
          수령하신 농산물에 <strong>심한 상처, 부패, 오배송, 누락</strong> 등이 있는 경우,
          상품 수령 후 <strong>24시간 이내</strong> 고객센터로 문의해 주세요.
        </li>
        <li className="mb-1">
          신속한 처리를 위해 상품 전체 사진, 박스 외관, 운송장 사진 등 상태 확인이 가능한
          이미지를 요청드릴 수 있습니다.
        </li>
        <li className="mb-1">
          판매자 책임으로 확인되는 경우 <strong>전액 환불</strong> 또는
          <strong> 재발송</strong>으로 안내해 드립니다.
        </li>
      </ul>

      <p className="mb-1 fw-semibold">02. 단순 변심 / 주문 착오의 경우</p>
      <ul className="mb-3 ps-3">
        <li className="mb-1">
          신선/냉장/냉동 농산물은 상품 특성상
          <strong> 단순 변심·주문 착오에 의한 교환/반품이 어렵습니다.</strong>
        </li>
        <li className="mb-1">
          비신선 상품 등 반품이 가능한 상품의 경우, 상품 수령 후 <strong>7일 이내</strong> 요청해 주셔야 합니다.
        </li>
        <li className="mb-1">
          단순 변심에 의한 반품 시 왕복 배송비(기본 6,000원)가 공제된 후 환불됩니다.
        </li>
      </ul>

      <p className="mb-1 fw-semibold">03. 교환/반품이 불가한 경우</p>
      <ul className="mb-3 ps-3">
        <li className="mb-1">고객 부주의로 인한 상품 훼손·변질, 보관 방법 미준수로 인한 품질 저하</li>
        <li className="mb-1">포장을 개봉하여 상품 가치가 현저히 감소한 경우</li>
        <li className="mb-1">시간이 지나 상품 가치가 감소한 경우</li>
        <li className="mb-1">냉장/냉동/신선 상품의 단순 변심으로 인한 반품 불가</li>
      </ul>

      <p className="mb-2 fw-semibold">04. 주문 취소 및 결제 안내</p>
      <ul className="mb-0 ps-3">
        <li className="mb-1">
          주문 취소는 <strong>배송 준비 전까지</strong> 마이페이지 &gt; 주문내역에서 가능합니다.
        </li>
        <li className="mb-1">산지에서 이미 수확/포장된 경우 주문 취소가 제한될 수 있습니다.</li>
        <li className="mb-1">결제 취소 후 환불 시기는 카드사 정책에 따릅니다.</li>
      </ul>

    </div>
  );
};

export default StoreInfoBox;