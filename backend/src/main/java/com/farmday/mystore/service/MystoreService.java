package com.farmday.mystore.service;

import com.farmday.mystore.dto.MystoreDTO;

public interface MystoreService {

    //상점 정보 조회
    public MystoreDTO selectStore(Long producerId);

    //스토어 메인 대시보드용
    public MystoreDTO selectStoreBoard(Long producerId);

    //업데이트
    public void updateStore(MystoreDTO dto);

}