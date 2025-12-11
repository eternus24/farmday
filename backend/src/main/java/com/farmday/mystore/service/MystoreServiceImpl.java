package com.farmday.mystore.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmday.mystore.dto.MystoreDTO;
import com.farmday.mystore.mapper.MystoreMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MystoreServiceImpl implements MystoreService {

    private final MystoreMapper mystoreMapper;

    @Override
    public MystoreDTO selectStore(Long producerId){
        return mystoreMapper.selectStore(producerId);
    }

    @Override
    public MystoreDTO selectStoreBoard(Long producerId){
        return mystoreMapper.selectStoreBoard(producerId);
    }

    @Override
    @Transactional
    public void updateStore(MystoreDTO dto){

        // 1) 스토어 기본 정보 업데이트 (store_name, description, thumbnail, status 등)
        mystoreMapper.updateStoreInfo(dto);

        // 2) 생산자 정보 업데이트 (biz_no, biz_addr, biz_phone, 계좌 정보 등)
        mystoreMapper.updateProducerInfo(dto);
    }

    // 전체 상점
    @Override
    public List<MystoreDTO> getAllStoreList(){
        return mystoreMapper.getAllStoreList();
    }
}