package com.nli.tagwise.services;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.nli.tagwise.custom.CodeExpiredException;

import java.util.Random;
import java.util.concurrent.TimeUnit;

// cette classe s'occupe de la gestion des codes de verif

@Service
public class RedisVerificationService {

    // c'est un template qui permet d'interagir avec redis database
    private final StringRedisTemplate redisTemplate;
    private static final String PREFIX = "verify:"; // Redis key prefix

    public RedisVerificationService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // Generate and store a code (TTL = 15 mins)
    public String generateAndStoreCode(Long userId) {
        String code = generateRandomCode();
        String key = PREFIX + userId;
        redisTemplate.opsForValue().set(key, code, 15, TimeUnit.MINUTES);
        return code;
    }

    public boolean isCodeValid(Long userId, String inputCode) {
        String key = "verify:" + userId;

        Boolean exists = redisTemplate.hasKey(key);
        if (exists == null || !exists) {
            throw new CodeExpiredException("Verification code expired or doesn't exist!");
        }

        String storedCode = redisTemplate.opsForValue().get(key);
        if (inputCode.equals(storedCode)) {
            deleteCode(userId);
            return true;
        }
        return false;
    }

    // Delete the code after successful verification
    public void deleteCode(Long userId) {
        String key = PREFIX + userId;
        redisTemplate.delete(key);
    }

    public String getCode(Long userId) {
        String key = PREFIX + userId;
        return redisTemplate.opsForValue().get(key);
    }

    private String generateRandomCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    // public static void main(String[] args) {
    // RedisVerificationService rd = new RedisVerificationService(null);
    // System.out.println(rd.generateRandomCode());
    // }
}
