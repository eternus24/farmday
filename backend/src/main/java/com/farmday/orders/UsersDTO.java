// src/main/java/com/farmday/user/domain/User.java
package com.farmday.orders;

import lombok.Data;
import java.util.Date;

@Data
public class UsersDTO {
    // 왜 snake? DB 컬럼과 1:1로 맞춰 가독성/명시성 확보(프로젝트 컨벤션 전제)
    private Long user_no;
    private String role;
    private String userid;
    private String userpwd;
    private String addr;
    private String name;
    private String phone;
    private String phone_verified;
    private String email;
    private String email_verified;
    private String email_verify_token;
    private Date email_verify_expired_at;
    private Date birth;
    private String gender;
    private String photo;
    private Date last_login_at;
    private Date created_date;
    private Date updated_date;
    private String is_blocked;
    private String block_reason;
    private Date blocked_at;

    private String user_grade;
    private int points;
    private String grade_code;

    private double point_rate;
}
