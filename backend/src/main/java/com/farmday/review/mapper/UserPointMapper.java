package com.farmday.review.mapper;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserPointMapper {
    
    public void insertUserPoint(Map<String,Object>param);

    public void updateUserPoint(Map<String,Object>param);
    
}