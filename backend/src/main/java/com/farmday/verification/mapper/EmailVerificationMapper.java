package com.farmday.verification.mapper;

import com.farmday.verification.domain.EmailVerification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EmailVerificationMapper {

    Long getNextId();

    int insert(EmailVerification ev);

    EmailVerification findByToken(@Param("token") String token);

    void markVerified(@Param("emailId") Long emailId);

    void markUsed(@Param("emailId") Long emailId);
}