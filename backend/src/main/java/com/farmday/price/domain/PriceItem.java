// backend/src/main/java/com/farmday/price/domain/PriceItem.java
package com.farmday.price.domain;

// 품목 정보 엔티티 (예: 배추, 무, 당근 등)
public class PriceItem {

    private String itemId;     // 품목 ID
    private String itemName;   // 품목 이름
    private String category;   // 카테고리 (예: 채소, 과일 등)

    // getter / setter

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
