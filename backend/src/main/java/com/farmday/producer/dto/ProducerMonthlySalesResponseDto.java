// com.farmday.producer.dto.ProducerMonthlySalesResponseDto
package com.farmday.producer.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProducerMonthlySalesResponseDto {

    private List<DailySalesDto> dailySales;
    private List<SalesItemDto> salesItems;
    private List<TopProductDto> topProducts;
}