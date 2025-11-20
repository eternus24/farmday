package com.farmday.user.service;

import com.farmday.user.domain.UserToken;
import com.farmday.user.mapper.UserTokenMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class UserTokenServiceImpl implements UserTokenService {

    private final UserTokenMapper userTokenMapper;

    @Override
    public UserToken saveRefreshToken(Long userNo, String refreshToken) {
        Long tokenId = userTokenMapper.getNextTokenId();

        UserToken token = new UserToken();
        token.setTokenId(tokenId);
        token.setUserNo(userNo);
        token.setTokenValue(refreshToken);
        token.setTokenType("REFRESH");
        token.setIsActive("Y");
        token.setCreatedDate(new Date());
        // expiredDate는 JWT 만료시간 계산해서 넣어도 되고, 일단 null 유지 가능

        userTokenMapper.insertToken(token);
        return token;
    }

    @Override
    public UserToken getActiveToken(String refreshToken) {
        return userTokenMapper.findActiveByTokenValue(refreshToken);
    }

    @Override
    public void revokeToken(String refreshToken) {
        userTokenMapper.deactivateByTokenValue(refreshToken, new Date());
    }

    @Override
    public void revokeAllTokensForUser(Long userNo) {
        userTokenMapper.deactivateAllByUser(userNo, new Date());
    }
}
