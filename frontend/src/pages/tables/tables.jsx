// tables.jsx
import React, { useState } from "react";

/**
 * 오라클 DDL을 바탕으로 만든 정적 스키마 정보
 * - name: 테이블명
 * - description: 간단 설명
 * - columns: 컬럼 정의(문자열 배열)
 * - constraints: 제약조건(문자열 배열)
 */
const TABLES = [
  {
    name: "USERS",
    description: "기본 사용자 테이블",
    columns: [
      "role VARCHAR2(20)",
      "userId VARCHAR2(50) NOT NULL",
      "userPwd VARCHAR2(200) NOT NULL",
      "addr VARCHAR2(200)",
      "name VARCHAR2(50)",
      "phone VARCHAR2(20)",
      "phone_verified CHAR(1) DEFAULT 'N'",
      "email VARCHAR2(100)",
      "email_verified CHAR(1) DEFAULT 'N'",
      "email_verify_token VARCHAR2(200)",
      "email_verify_expired_at DATE",
      "birth DATE",
      "gender CHAR(1)",
      "photo VARCHAR2(300)",
      "last_login_at DATE",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE",
      "is_blocked CHAR(1) DEFAULT 'N'",
      "block_reason VARCHAR2(200)"
    ],
    constraints: [
      "pk_users PRIMARY KEY (userId)",
      "uq_users_email UNIQUE (email)",
      "chk_users_phone_verified CHECK (phone_verified IN ('Y', 'N'))",
      "chk_users_email_verified CHECK (email_verified IN ('Y', 'N'))",
      "chk_users_is_blocked CHECK (is_blocked IN ('Y', 'N'))"
    ]
  },
  {
    name: "CATEGORY",
    description: "상품 카테고리 (자기참조 구조)",
    columns: [
      "category_id NUMBER(10) NOT NULL",
      "parent_category_id NUMBER(10)",
      "category_name VARCHAR2(100) NOT NULL",
      "category_level NUMBER(1) NOT NULL",
      "display_order NUMBER(5)",
      "use_yn CHAR(1) DEFAULT 'Y'",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE"
    ],
    constraints: [
      "pk_category PRIMARY KEY (category_id)",
      "fk_category_parent FOREIGN KEY (parent_category_id) REFERENCES CATEGORY (category_id)",
      "chk_category_use_yn CHECK (use_yn IN ('Y', 'N'))"
    ]
  },
  {
    name: "PRODUCER",
    description: "생산자 정보 (USERS FK)",
    columns: [
      "producer_id NUMBER(10) NOT NULL",
      "user_no VARCHAR2(50) NOT NULL",
      "farm_name VARCHAR2(200) NOT NULL",
      "owner_name VARCHAR2(100)",
      "biz_reg_no VARCHAR2(50)",
      "contact VARCHAR2(50)",
      "address VARCHAR2(300)",
      "description VARCHAR2(1000)",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE",
      "status VARCHAR2(20) DEFAULT 'ACTIVE'"
    ],
    constraints: [
      "pk_producer PRIMARY KEY (producer_id)",
      "fk_producer_user FOREIGN KEY (user_no) REFERENCES USERS (userId)"
    ]
  },
  {
    name: "STORE",
    description: "매장/상점 정보",
    columns: [
      "store_id NUMBER(10) NOT NULL",
      "store_name VARCHAR2(200) NOT NULL",
      "owner_id VARCHAR2(50)",
      "address VARCHAR2(300)",
      "phone VARCHAR2(50)",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE",
      "status VARCHAR2(20)"
    ],
    constraints: [
      "pk_store PRIMARY KEY (store_id)",
      "fk_store_owner FOREIGN KEY (owner_id) REFERENCES USERS (userId)"
    ]
  },
  {
    name: "PRODUCT",
    description: "상품 마스터",
    columns: [
      "product_id NUMBER(10) NOT NULL",
      "producer_id NUMBER(10) NOT NULL",
      "category_id NUMBER(10) NOT NULL",
      "name VARCHAR2(200) NOT NULL",
      "description VARCHAR2(2000)",
      "base_price NUMBER(12, 2) NOT NULL",
      "status VARCHAR2(20) DEFAULT 'ON'",
      "main_image_url VARCHAR2(500)",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE",
      "like_count NUMBER(10) DEFAULT 0",
      "view_count NUMBER(10) DEFAULT 0"
    ],
    constraints: [
      "pk_product PRIMARY KEY (product_id)",
      "fk_product_producer FOREIGN KEY (producer_id) REFERENCES PRODUCER (producer_id)",
      "fk_product_category FOREIGN KEY (category_id) REFERENCES CATEGORY (category_id)",
      "chk_product_status CHECK (status IN ('ON', 'OFF', 'DELETED'))"
    ]
  },
  {
    name: "PRODUCT_DETAIL",
    description: "상품 옵션/상세",
    columns: [
      "detail_id NUMBER(10) NOT NULL",
      "product_id NUMBER(10) NOT NULL",
      "option_name VARCHAR2(200) NOT NULL",
      "option_value VARCHAR2(200)",
      "stock_qty NUMBER(10) DEFAULT 0",
      "sale_price NUMBER(12, 2)",
      "use_yn CHAR(1) DEFAULT 'Y'",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE"
    ],
    constraints: [
      "pk_product_detail PRIMARY KEY (detail_id)",
      "fk_product_detail_product FOREIGN KEY (product_id) REFERENCES PRODUCT (product_id)",
      "chk_product_detail_use_yn CHECK (use_yn IN ('Y', 'N'))"
    ]
  },
  {
    name: "PRODUCT_IMAGE",
    description: "상품 이미지",
    columns: [
      "image_id NUMBER(10) NOT NULL",
      "product_id NUMBER(10) NOT NULL",
      "image_url VARCHAR2(500) NOT NULL",
      "is_main CHAR(1) DEFAULT 'N'",
      "sort_order NUMBER(5)",
      "created_date DATE DEFAULT SYSDATE"
    ],
    constraints: [
      "pk_product_image PRIMARY KEY (image_id)",
      "fk_product_image_product FOREIGN KEY (product_id) REFERENCES PRODUCT (product_id)",
      "chk_product_image_is_main CHECK (is_main IN ('Y', 'N'))"
    ]
  },
  {
    name: "PRODUCT_CATEGORY",
    description: "상품-카테고리 다대다 매핑",
    columns: [
      "product_id NUMBER(10) NOT NULL",
      "category_id NUMBER(10) NOT NULL"
    ],
    constraints: [
      "pk_product_category PRIMARY KEY (product_id, category_id)",
      "fk_product_category_product FOREIGN KEY (product_id) REFERENCES PRODUCT (product_id)",
      "fk_product_category_category FOREIGN KEY (category_id) REFERENCES CATEGORY (category_id)"
    ]
  },
  {
    name: "PRICE_ITEM",
    description: "시세 품목 마스터",
    columns: [
      "item_code VARCHAR2(50) NOT NULL",
      "item_name VARCHAR2(100) NOT NULL",
      "category VARCHAR2(50)",
      "unit VARCHAR2(50)",
      "use_yn CHAR(1) DEFAULT 'Y'",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE"
    ],
    constraints: [
      "pk_price_item PRIMARY KEY (item_code)",
      "chk_price_item_use_yn CHECK (use_yn IN ('Y', 'N'))"
    ]
  },
  {
    name: "PRICE_MARKET",
    description: "시세 시장 마스터",
    columns: [
      "market_code VARCHAR2(50) NOT NULL",
      "market_name VARCHAR2(100) NOT NULL",
      "region_si VARCHAR2(50)",
      "region_gun VARCHAR2(50)",
      "region_detail VARCHAR2(100)",
      "use_yn CHAR(1) DEFAULT 'Y'",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE"
    ],
    constraints: [
      "pk_price_market PRIMARY KEY (market_code)",
      "chk_price_market_use_yn CHECK (use_yn IN ('Y', 'N'))"
    ]
  },
  {
    name: "PRICE_DAILY",
    description: "일별 시세",
    columns: [
      "price_daily_id NUMBER(20) NOT NULL",
      "item_code VARCHAR2(50) NOT NULL",
      "market_code VARCHAR2(50) NOT NULL",
      "price_date DATE NOT NULL",
      "grade VARCHAR2(50)",
      "unit VARCHAR2(50)",
      "price NUMBER(12, 2) NOT NULL",
      "currency VARCHAR2(10) DEFAULT 'KRW'",
      "created_date DATE DEFAULT SYSDATE"
    ],
    constraints: [
      "pk_price_daily PRIMARY KEY (price_daily_id)",
      "fk_price_daily_item FOREIGN KEY (item_code) REFERENCES PRICE_ITEM (item_code)",
      "fk_price_daily_market FOREIGN KEY (market_code) REFERENCES PRICE_MARKET (market_code)"
    ]
  },
  {
    name: "PRICE_FETCH_LOG",
    description: "시세 수집 로그",
    columns: [
      "fetch_id NUMBER(20) NOT NULL",
      "run_date DATE NOT NULL",
      "run_time DATE NOT NULL",
      "status VARCHAR2(20) NOT NULL",
      "source VARCHAR2(50)",
      "total_count NUMBER(10)",
      "success_count NUMBER(10)",
      "fail_count NUMBER(10)",
      "error_message VARCHAR2(1000)",
      "created_date DATE DEFAULT SYSDATE"
    ],
    constraints: [
      "pk_price_fetch_log PRIMARY KEY (fetch_id)",
      "chk_price_fetch_log_status CHECK (status IN ('SUCCESS', 'FAIL'))",
      "chk_price_fetch_log_counts CHECK (total_count >= 0 AND success_count >= 0 AND fail_count >= 0)"
    ]
  },
  {
    name: "BANNER",
    description: "배너 관리",
    columns: [
      "banner_id NUMBER(10) NOT NULL",
      "title VARCHAR2(200) NOT NULL",
      "image_url VARCHAR2(500)",
      "link_url VARCHAR2(500)",
      "position VARCHAR2(50)",
      "is_active CHAR(1) DEFAULT 'Y'",
      "start_date DATE",
      "end_date DATE",
      "created_by VARCHAR2(50) NOT NULL",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE"
    ],
    constraints: [
      "pk_banner PRIMARY KEY (banner_id)",
      "fk_banner_created_by FOREIGN KEY (created_by) REFERENCES USERS (userId)",
      "chk_banner_is_active CHECK (is_active IN ('Y', 'N'))"
    ]
  },
  {
    name: "NOTICE",
    description: "공지사항",
    columns: [
      "notice_id NUMBER(10) NOT NULL",
      "title VARCHAR2(200) NOT NULL",
      "content VARCHAR2(4000) NOT NULL",
      "image_url VARCHAR2(500)",
      "is_top CHAR(1) DEFAULT 'N'",
      "view_count NUMBER(10) DEFAULT 0",
      "created_by VARCHAR2(50) NOT NULL",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE"
    ],
    constraints: [
      "pk_notice PRIMARY KEY (notice_id)",
      "fk_notice_created_by FOREIGN KEY (created_by) REFERENCES USERS (userId)",
      "chk_notice_is_top CHECK (is_top IN ('Y', 'N'))"
    ]
  },
  {
    name: "NOTICE_IMAGE",
    description: "공지사항 이미지 (복수)",
    columns: [
      "notice_image_id NUMBER(10) NOT NULL",
      "notice_id NUMBER(10) NOT NULL",
      "image_url VARCHAR2(500) NOT NULL",
      "sort_order NUMBER(5)"
    ],
    constraints: [
      "pk_notice_image PRIMARY KEY (notice_image_id)",
      "fk_notice_image_notice FOREIGN KEY (notice_id) REFERENCES NOTICE (notice_id)"
    ]
  },
  {
    name: "CART",
    description: "장바구니",
    columns: [
      "cart_id NUMBER(20) NOT NULL",
      "user_id VARCHAR2(50) NOT NULL",
      "product_id NUMBER(10) NOT NULL",
      "detail_id NUMBER(10)",
      "quantity NUMBER(10) DEFAULT 1",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE"
    ],
    constraints: [
      "pk_cart PRIMARY KEY (cart_id)",
      "fk_cart_user FOREIGN KEY (user_id) REFERENCES USERS (userId)",
      "fk_cart_product FOREIGN KEY (product_id) REFERENCES PRODUCT (product_id)",
      "fk_cart_detail FOREIGN KEY (detail_id) REFERENCES PRODUCT_DETAIL (detail_id)"
    ]
  },
  {
    name: "WISHLIST",
    description: "위시리스트",
    columns: [
      "wishlist_id NUMBER(20) NOT NULL",
      "user_id VARCHAR2(50) NOT NULL",
      "product_id NUMBER(10) NOT NULL",
      "created_date DATE DEFAULT SYSDATE"
    ],
    constraints: [
      "pk_wishlist PRIMARY KEY (wishlist_id)",
      "fk_wishlist_user FOREIGN KEY (user_id) REFERENCES USERS (userId)",
      "fk_wishlist_product FOREIGN KEY (product_id) REFERENCES PRODUCT (product_id)"
    ]
  },
  {
    name: "GROUP_DEAL",
    description: "공동구매 이벤트",
    columns: [
      "group_deal_id NUMBER(20) NOT NULL",
      "product_id NUMBER(10) NOT NULL",
      "detail_id NUMBER(10)",
      "title VARCHAR2(200) NOT NULL",
      "sub_title VARCHAR2(300)",
      "origin_price NUMBER(12, 2)",
      "deal_price NUMBER(12, 2)",
      "discount_rate NUMBER(5, 2)",
      "min_member_count NUMBER(5) NOT NULL",
      "max_member_count NUMBER(5)",
      "per_user_limit_qty NUMBER(5)",
      "start_at DATE NOT NULL",
      "end_at DATE NOT NULL",
      "status VARCHAR2(20) DEFAULT 'SCHEDULED'",
      "is_active CHAR(1) DEFAULT 'Y'",
      "created_by VARCHAR2(50) NOT NULL",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE"
    ],
    constraints: [
      "pk_group_deal PRIMARY KEY (group_deal_id)",
      "fk_group_deal_product FOREIGN KEY (product_id) REFERENCES PRODUCT (product_id)",
      "fk_group_deal_detail FOREIGN KEY (detail_id) REFERENCES PRODUCT_DETAIL (detail_id)",
      "fk_group_deal_created_by FOREIGN KEY (created_by) REFERENCES USERS (userId)",
      "chk_group_deal_is_active CHECK (is_active IN ('Y', 'N'))"
    ]
  },
  {
    name: "ORDER",
    description: "주문 헤더",
    columns: [
      "order_id NUMBER(20) NOT NULL",
      "user_id VARCHAR2(50) NOT NULL",
      "group_deal_id NUMBER(20)",
      "order_status VARCHAR2(20) DEFAULT 'PENDING'",
      "order_date DATE DEFAULT SYSDATE",
      "total_amount NUMBER(12, 2) NOT NULL",
      "payment_method VARCHAR2(50)",
      "recipient_name VARCHAR2(100)",
      "recipient_phone VARCHAR2(20)",
      "recipient_addr VARCHAR2(300)",
      "memo VARCHAR2(500)"
    ],
    constraints: [
      "pk_order PRIMARY KEY (order_id)",
      "fk_order_user FOREIGN KEY (user_id) REFERENCES USERS (userId)",
      "fk_order_group_deal FOREIGN KEY (group_deal_id) REFERENCES GROUP_DEAL (group_deal_id)"
    ]
  },
  {
    name: "ORDER_ITEM",
    description: "주문 상세",
    columns: [
      "order_item_id NUMBER(20) NOT NULL",
      "order_id NUMBER(20) NOT NULL",
      "product_id NUMBER(10) NOT NULL",
      "detail_id NUMBER(10)",
      "quantity NUMBER(10) NOT NULL",
      "unit_price NUMBER(12, 2) NOT NULL",
      "total_price NUMBER(12, 2) NOT NULL"
    ],
    constraints: [
      "pk_order_item PRIMARY KEY (order_item_id)",
      "fk_order_item_order FOREIGN KEY (order_id) REFERENCES ORDER (order_id)",
      "fk_order_item_product FOREIGN KEY (product_id) REFERENCES PRODUCT (product_id)",
      "fk_order_item_detail FOREIGN KEY (detail_id) REFERENCES PRODUCT_DETAIL (detail_id)"
    ]
  },
  {
    name: "PAYMENT",
    description: "결제 정보",
    columns: [
      "payment_id NUMBER(20) NOT NULL",
      "order_id NUMBER(20) NOT NULL",
      "amount NUMBER(12, 2) NOT NULL",
      "payment_method VARCHAR2(50)",
      "payment_status VARCHAR2(20) DEFAULT 'PENDING'",
      "paid_at DATE",
      "created_date DATE DEFAULT SYSDATE"
    ],
    constraints: [
      "pk_payment PRIMARY KEY (payment_id)",
      "fk_payment_order FOREIGN KEY (order_id) REFERENCES ORDER (order_id)"
    ]
  },
  {
    name: "DELIVERY",
    description: "배송 정보",
    columns: [
      "delivery_id NUMBER(20) NOT NULL",
      "order_id NUMBER(20) NOT NULL",
      "delivery_status VARCHAR2(20) DEFAULT 'READY'",
      "tracking_number VARCHAR2(100)",
      "courier VARCHAR2(100)",
      "shipped_at DATE",
      "delivered_at DATE"
    ],
    constraints: [
      "pk_delivery PRIMARY KEY (delivery_id)",
      "fk_delivery_order FOREIGN KEY (order_id) REFERENCES ORDER (order_id)"
    ]
  },
  {
    name: "GROUP_DEAL_TEAM",
    description: "공동구매 팀/방",
    columns: [
      "team_id NUMBER(20) NOT NULL",
      "group_deal_id NUMBER(20) NOT NULL",
      "leader_user_id VARCHAR2(50) NOT NULL",
      "target_member_cnt NUMBER(5) NOT NULL",
      "current_member_cnt NUMBER(5) DEFAULT 1",
      "status VARCHAR2(20) DEFAULT 'WAITING'",
      "opened_at DATE DEFAULT SYSDATE",
      "closed_at DATE",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE"
    ],
    constraints: [
      "pk_group_deal_team PRIMARY KEY (team_id)",
      "fk_group_deal_team_deal FOREIGN KEY (group_deal_id) REFERENCES GROUP_DEAL (group_deal_id)",
      "fk_group_deal_team_leader FOREIGN KEY (leader_user_id) REFERENCES USERS (userId)"
    ]
  },
  {
    name: "GROUP_DEAL_MEMBER",
    description: "공동구매 참여자",
    columns: [
      "member_id NUMBER(20) NOT NULL",
      "team_id NUMBER(20) NOT NULL",
      "user_id VARCHAR2(50) NOT NULL",
      "order_id NUMBER(20)",
      "order_item_id NUMBER(20)",
      "status VARCHAR2(20) DEFAULT 'PENDING_PAYMENT'",
      "result_notified_at DATE",
      "joined_at DATE DEFAULT SYSDATE"
    ],
    constraints: [
      "pk_group_deal_member PRIMARY KEY (member_id)",
      "fk_gdm_team FOREIGN KEY (team_id) REFERENCES GROUP_DEAL_TEAM (team_id)",
      "fk_gdm_user FOREIGN KEY (user_id) REFERENCES USERS (userId)",
      "fk_gdm_order FOREIGN KEY (order_id) REFERENCES ORDER (order_id)",
      "fk_gdm_order_item FOREIGN KEY (order_item_id) REFERENCES ORDER_ITEM (order_item_id)",
      "chk_gdm_status CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'CANCELED', 'REFUNDED'))",
      "uq_gdm_team_user UNIQUE (team_id, user_id)"
    ]
  },
  {
    name: "PRODUCT_QNA",
    description: "상품 문의",
    columns: [
      "qna_id NUMBER(20) NOT NULL",
      "product_id NUMBER(10) NOT NULL",
      "store_id NUMBER(10)",
      "writer_id VARCHAR2(50) NOT NULL",
      "question VARCHAR2(2000) NOT NULL",
      "answer VARCHAR2(2000)",
      "status VARCHAR2(20) DEFAULT 'WAITING'",
      "created_date DATE DEFAULT SYSDATE",
      "answered_date DATE"
    ],
    constraints: [
      "pk_product_qna PRIMARY KEY (qna_id)",
      "fk_product_qna_product FOREIGN KEY (product_id) REFERENCES PRODUCT (product_id)",
      "fk_product_qna_store FOREIGN KEY (store_id) REFERENCES STORE (store_id)",
      "fk_product_qna_writer FOREIGN KEY (writer_id) REFERENCES USERS (userId)"
    ]
  },
  {
    name: "PRODUCT_REVIEW",
    description: "상품 리뷰",
    columns: [
      "review_id NUMBER(20) NOT NULL",
      "product_id NUMBER(10) NOT NULL",
      "store_id NUMBER(10)",
      "order_item_id NUMBER(20)",
      "user_id VARCHAR2(50) NOT NULL",
      "rating NUMBER(2)",
      "content VARCHAR2(2000)",
      "created_date DATE DEFAULT SYSDATE",
      "updated_date DATE"
    ],
    constraints: [
      "pk_product_review PRIMARY KEY (review_id)",
      "fk_product_review_product FOREIGN KEY (product_id) REFERENCES PRODUCT (product_id)",
      "fk_product_review_store FOREIGN KEY (store_id) REFERENCES STORE (store_id)",
      "fk_product_review_order_item FOREIGN KEY (order_item_id) REFERENCES ORDER_ITEM (order_item_id)",
      "fk_product_review_user FOREIGN KEY (user_id) REFERENCES USERS (userId)"
    ]
  },
  {
    name: "VISIT_LOG",
    description: "매장 방문 로그",
    columns: [
      "visit_id NUMBER(20) NOT NULL",
      "store_id NUMBER(10) NOT NULL",
      "user_id VARCHAR2(50)",
      "visit_date DATE DEFAULT SYSDATE",
      "device_type VARCHAR2(20)",
      "created_date DATE DEFAULT SYSDATE"
    ],
    constraints: [
      "pk_visit_log PRIMARY KEY (visit_id)",
      "fk_visit_log_store FOREIGN KEY (store_id) REFERENCES STORE (store_id)",
      "fk_visit_log_user FOREIGN KEY (user_id) REFERENCES USERS (userId)"
    ]
  },
  {
    name: "NOTIFICATION",
    description: "알림 정보",
    columns: [
      "notification_id NUMBER(20) NOT NULL",
      "user_id VARCHAR2(50) NOT NULL",
      "type VARCHAR2(50)",
      "title VARCHAR2(200)",
      "message VARCHAR2(1000)",
      "product_id NUMBER(10)",
      "store_id NUMBER(10)",
      "group_deal_id NUMBER(20)",
      "is_read CHAR(1) DEFAULT 'N'",
      "read_at DATE",
      "created_at DATE DEFAULT SYSDATE"
    ],
    constraints: [
      "pk_notification PRIMARY KEY (notification_id)",
      "fk_notification_user FOREIGN KEY (user_id) REFERENCES USERS (userId)",
      "fk_notification_product FOREIGN KEY (product_id) REFERENCES PRODUCT (product_id)",
      "fk_notification_store FOREIGN KEY (store_id) REFERENCES STORE (store_id)",
      "fk_notification_groupdeal FOREIGN KEY (group_deal_id) REFERENCES GROUP_DEAL (group_deal_id)",
      "chk_notification_isread CHECK (is_read IN ('Y', 'N'))"
    ]
  }
];

// 간단 스타일 모음 (필요하면 CSS 파일로 빼도 됨)
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    minHeight: "600px",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: "14px",
    color: "#222",
    overflow: "hidden",
  },
  sidebar: {
    width: "260px",
    borderRight: "1px solid #eee",
    padding: "16px",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column"
  },
  sidebarTitle: {
    margin: "0 0 12px",
    fontSize: "16px",
    fontWeight: 700
  },
  sidebarList: {
    flex: 1,
    overflowY: "auto",
    paddingRight: "4px"
  },
  tableButton: {
    width: "100%",
    textAlign: "left",
    padding: "8px 10px",
    marginBottom: "4px",
    borderRadius: "6px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    transition: "background 0.15s, transform 0.05s"
  },
  tableButtonActive: {
    backgroundColor: "#e6f3ff",
    fontWeight: 600
  },
//   tableButtonHover: {
//     backgroundColor: "#f0f0f0"
//   },
  tableButtonName: {
    fontSize: "13px"
  },
  tableButtonDesc: {
    fontSize: "11px",
    color: "#777",
    marginTop: "2px"
  },
  content: {
    flex: 1,
    padding: "20px 24px",
    boxSizing: "border-box",
    overflowY: "auto"
  },
  placeholder: {
    marginTop: "60px",
    textAlign: "center",
    color: "#888",
    lineHeight: 1.6,
    fontSize: "15px"
  },
  tableTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700
  },
  tableDesc: {
    marginTop: "6px",
    fontSize: "13px",
    color: "#666"
  },
  sectionTitle: {
    marginTop: "24px",
    marginBottom: "8px",
    fontSize: "15px",
    fontWeight: 600
  },
  columnsTable: {
    borderCollapse: "collapse",
    width: "100%",
    maxWidth: "900px"
  },
  columnCell: {
    borderBottom: "1px solid #eee",
    padding: "4px 8px",
    fontFamily: "Menlo, Consolas, monospace",
    fontSize: "12px",
    whiteSpace: "nowrap"
  },
  constraintsList: {
    listStyle: "disc",
    paddingLeft: "18px",
    fontFamily: "Menlo, Consolas, monospace",
    fontSize: "12px"
  },
  constraintsItem: {
    marginBottom: "4px"
  }
};

const Tables = () => {
  const [selectedTableName, setSelectedTableName] = useState(null);
  const [hoveredTableName, setHoveredTableName] = useState(null);

  const selectedTable =
    TABLES.find((t) => t.name === selectedTableName) || null;

  return (
    <div style={styles.container}>
      {/* 왼쪽 사이드바: 테이블 목록 */}
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>테이블 목록</h2>
        <div style={styles.sidebarList}>
          {TABLES.map((table) => {
            const isActive = selectedTableName === table.name;
            const isHover = hoveredTableName === table.name;

            return (
              <button
                key={table.name}
                type="button"
                style={{
                  ...styles.tableButton,
                  ...(isActive ? styles.tableButtonActive : {}),
                  ...(isHover && !isActive ? styles.tableButtonHover : {})
                }}
                onClick={() => setSelectedTableName(table.name)}
                onMouseEnter={() => setHoveredTableName(table.name)}
                onMouseLeave={() => setHoveredTableName(null)}
              >
                <div style={styles.tableButtonName}>{table.name}</div>
                {table.description && (
                  <div style={styles.tableButtonDesc}>
                    {table.description}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* 오른쪽: 선택된 테이블 상세 정보 */}
      <main style={styles.content}>
        {!selectedTable && (
          <div style={styles.placeholder}>
            <p>왼쪽에서 테이블을 하나 선택하면</p>
            <p>컬럼 정보와 제약조건을 여기에서 확인할 수 있습니다.</p>
          </div>
        )}

        {selectedTable && (
          <div>
            <h1 style={styles.tableTitle}>{selectedTable.name}</h1>
            {selectedTable.description && (
              <p style={styles.tableDesc}>{selectedTable.description}</p>
            )}

            {/* 컬럼 정보 */}
            <section>
              <h2 style={styles.sectionTitle}>컬럼 정보</h2>
              <table style={styles.columnsTable}>
                <tbody>
                  {selectedTable.columns.map((col) => (
                    <tr key={col}>
                      <td style={styles.columnCell}>{col}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 제약조건 정보 */}
            {selectedTable.constraints &&
              selectedTable.constraints.length > 0 && (
                <section>
                  <h2 style={styles.sectionTitle}>제약조건</h2>
                  <ul style={styles.constraintsList}>
                    {selectedTable.constraints.map((c) => (
                      <li key={c} style={styles.constraintsItem}>
                        {c}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tables;
