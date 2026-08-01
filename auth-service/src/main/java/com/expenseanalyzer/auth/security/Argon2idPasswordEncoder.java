package com.expenseanalyzer.auth.security;

import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Argon2id password encoder using BouncyCastle.
 * Parameters follow OWASP recommended configuration:
 *   - iterations: 3
 *   - memory: 64MB
 *   - parallelism: 4
 *   - hash length: 32 bytes
 *   - salt length: 16 bytes
 */
public class Argon2idPasswordEncoder implements PasswordEncoder {

    private static final int ITERATIONS = 3;
    private static final int MEMORY_KB = 65536; // 64 MB
    private static final int PARALLELISM = 4;
    private static final int HASH_LENGTH = 32;
    private static final int SALT_LENGTH = 16;

    @Override
    public String encode(CharSequence rawPassword) {
        byte[] salt = generateSalt();
        byte[] hash = hashPassword(rawPassword.toString(), salt);
        // Encode as: $argon2id$salt_b64$hash_b64
        return "$argon2id$" +
               Base64.getEncoder().encodeToString(salt) + "$" +
               Base64.getEncoder().encodeToString(hash);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        String[] parts = encodedPassword.split("\\$");
        // parts[0] = "", parts[1] = "argon2id", parts[2] = salt_b64, parts[3] = hash_b64
        if (parts.length != 4 || !"argon2id".equals(parts[1])) {
            return false;
        }
        byte[] salt = Base64.getDecoder().decode(parts[2]);
        byte[] expectedHash = Base64.getDecoder().decode(parts[3]);
        byte[] actualHash = hashPassword(rawPassword.toString(), salt);

        // Constant-time comparison to prevent timing attacks
        if (actualHash.length != expectedHash.length) return false;
        int diff = 0;
        for (int i = 0; i < actualHash.length; i++) {
            diff |= actualHash[i] ^ expectedHash[i];
        }
        return diff == 0;
    }

    private byte[] hashPassword(String password, byte[] salt) {
        Argon2Parameters params = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                .withSalt(salt)
                .withIterations(ITERATIONS)
                .withMemoryAsKB(MEMORY_KB)
                .withParallelism(PARALLELISM)
                .build();

        Argon2BytesGenerator generator = new Argon2BytesGenerator();
        generator.init(params);

        byte[] hash = new byte[HASH_LENGTH];
        generator.generateBytes(password.getBytes(StandardCharsets.UTF_8), hash);
        return hash;
    }

    private byte[] generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[SALT_LENGTH];
        random.nextBytes(salt);
        return salt;
    }
}
