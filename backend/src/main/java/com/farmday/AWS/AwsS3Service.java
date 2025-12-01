package com.farmday.AWS;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.core.sync.RequestBody;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AwsS3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.region}")
    private String region;

    public String upload(MultipartFile file) {
        String ext = getExtension(file.getOriginalFilename());
        String key = "images/" + UUID.randomUUID() + ext;

        try {
            PutObjectRequest putReq = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .acl(ObjectCannedACL.PUBLIC_READ) // ACLs enabled + Public Read 전제
                    .build();

            s3Client.putObject(
                    putReq,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );

            return String.format("https://%s.s3.%s.amazonaws.com/%s",
                    bucket,
                    region,
                    key
            );
        } catch (IOException e) {
            throw new RuntimeException("S3 업로드 실패", e);
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(dot) : "";
    }
}