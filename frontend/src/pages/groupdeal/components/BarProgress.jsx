// 경로: frontend/src/pages/groupdeal/components/BarProgress.jsx
import React, { useEffect, useState } from "react";

const BarProgress = ({ currentQuantity, minMemberCount }) => {
    const [progress, setProgress] = useState(0);

    const percent = Math.round((currentQuantity / minMemberCount) * 100);

    useEffect(() => {
        let start = 0;
        const timer = setInterval(() => {
            start += 2;
            if (start >= percent) {
                start = percent;
                clearInterval(timer);
            }
            setProgress(start);
        }, 20);

        return () => clearInterval(timer);
    }, [percent]);

    // color based on % 
    const getColor = (v) => {
        if (v < 50) return "#8BC34A"; // 연초록
        if (v < 80) return "#4CAF50"; // 중초록
        if (v < 100) return "#2E7D32"; // 진초록
        return "#FFD600"; // 100% 금빛
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.boldText}>
                    {currentQuantity} 개 / 목표 {minMemberCount} 개
                </div>
                <div style={styles.percentText}>{progress}%</div>
            </div>

            <div style={styles.barBackground}>
                <div 
                    style={{
                        ...styles.barFill,
                        width: `${progress}%`,
                        backgroundColor: getColor(progress)
                    }}
                />
            </div>

            <div style={styles.subText}>
                남은 {minMemberCount - currentQuantity} 개
            </div>
        </div>
    );
};

const styles = {
    container: { 
        display: "flex",
        flexDirection: "column", 
        margin: "20px 0",
        width: "100%"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px"
    },
    boldText: {
        fontSize: "20px",
        fontWeight: "700"
    },
    percentText: {
        fontSize: "24px",
        fontWeight: "800",
        color: "#1B5E20"
    },
    barBackground: {
        width: "100%",
        height: "24px",
        backgroundColor: "#E0E0E0",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative"
    },
    barFill: {
        height: "100%",
        borderRadius: "12px",
        transition: "width 0.4s ease, background-color 0.4s ease"
    },
    subText: {
        fontSize: "16px",
        fontWeight: "500",
        color: "#666",
        marginTop: "8px",
        textAlign: "right"
    }
};

export default BarProgress;