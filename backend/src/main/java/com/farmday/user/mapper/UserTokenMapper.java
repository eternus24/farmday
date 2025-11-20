package com.farmday.user.mapper;

import com.farmday.user.domain.UserToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserTokenMapper {

    Long getNextTokenId();

    void insertToken(UserToken token);

    // 활성 상태의 토큰만 조회
    UserToken findActiveByTokenValue(@Param("tokenValue") String tokenValue);

    // 해당 토큰을 비활성화(로그아웃/로테이션)
    void deactivateByTokenValue(@Param("tokenValue") String tokenValue,
                                @Param("revokedDate") java.util.Date revokedDate);

    // 필요하면 유저 전체 로그아웃용 (옵션)
    void deactivateAllByUser(@Param("userNo") Long userNo,
                             @Param("revokedDate") java.util.Date revokedDate);
}