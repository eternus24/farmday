package com.farmday.mystore.service;

import com.farmday.mystore.dto.MystoreDTO;

public interface MystoreService {

    //상점 정보 조회
    public MystoreDTO selectStore(long producerId);

    //스토어 메인 대시보드용
    public MystoreDTO selectStoreBoard(long producerId);

}