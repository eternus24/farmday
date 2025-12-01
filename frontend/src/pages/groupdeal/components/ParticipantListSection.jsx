// 경로: frontend/src/pages/groupdeal/components/ParticipantListSection.jsx
import React from "react";

const ParticipantListSection = ({ participants }) => {
  return (
    <div style={styles.section}>
      <div style={styles.title}>👥 공동구매 참여자 목록</div>

      {(!participants || participants.length === 0) && (
        <div style={styles.noData}>아직 참여자가 없습니다.</div>
      )}

      {participants && participants.length > 0 && (
        <div style={styles.list}>
          {participants.map((p, idx) => (
            <div key={idx} style={styles.item}>
              <div style={styles.left}>
                <div style={styles.name}>{p.userName}</div>
                <div style={styles.info}>
                  {p.email} | {p.phone}
                </div>
              </div>

              <div style={styles.right}>
                <div style={styles.qty}>
                  {p.quantity} 개
                </div>

                <div style={styles.date}>
                  {new Date(p.joinedAt).toLocaleDateString()}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  section: {
    marginTop: "40px",
    borderTop: "2px solid #ddd",
    paddingTop: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "900",
    marginBottom: "18px",
  },
  noData: {
    fontSize: "18px",
    color: "#777",
    paddingBottom: "10px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    background: "#FAFFFA",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #D5EED5",
  },
  left: {
    display: "flex",
    flexDirection: "column",
  },
  name: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: "4px",
  },
  info: {
    fontSize: "16px",
    color: "#555",
  },
  right: {
    textAlign: "right",
  },
  qty: {
    fontSize: "22px",
    fontWeight: "900",
    color: "#1B5E20",
    marginBottom: "4px",
  },
  date: {
    fontSize: "16px",
    color: "#666",
  },
};

export default ParticipantListSection;
