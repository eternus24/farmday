
package com.farmday.mystore.mapper;


import org.apache.ibatis.annotations.Mapper;

import com.farmday.mystore.dto.MystoreDTO;

@Mapper
public interface MystoreMapper {

    //상점 정보 조회
    public MystoreDTO selectStore(long producerId);

    //스토어 메인 대시보드용
    public MystoreDTO selectStoreBoard(long producerId);
    
}