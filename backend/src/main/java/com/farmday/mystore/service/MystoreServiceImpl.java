package com.farmday.mystore.service;

import java.util.List;

import org.springframework.stereotype.Service;

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
    public void updateStore(MystoreDTO dto){

        //스토어 업데이트
        mystoreMapper.updateStoreInfo(dto);

        //producer 업데이트
        mystoreMapper.updateProducerInfo(dto);

    }

    //전체 상점
    public List<MystoreDTO> getAllStoreList(){
        return mystoreMapper.getAllStoreList();
    }
}