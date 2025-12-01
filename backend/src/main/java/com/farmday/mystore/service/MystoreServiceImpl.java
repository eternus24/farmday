package com.farmday.mystore.service;

import org.springframework.stereotype.Service;

import com.farmday.mystore.dto.MystoreDTO;
import com.farmday.mystore.mapper.MystoreMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MystoreServiceImpl implements MystoreService {

    private final MystoreMapper mystoreMapper;

    @Override
    public MystoreDTO selectStore(long producerId){
        return mystoreMapper.selectStore(producerId);
    }

    @Override
    public MystoreDTO selectStoreBoard(long producerId){
        return mystoreMapper.selectStoreBoard(producerId);
    }
    
}