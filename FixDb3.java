import java.sql.*;

public class FixDb3 {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://localhost:5432/postgres";
        String user = "postgres";
        String password = "postgres123";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            stmt.execute("CREATE SCHEMA IF NOT EXISTS auth;");
            System.out.println("Schema auth verified.");

            String createOtps = "CREATE TABLE IF NOT EXISTS auth.otps (" +
                    "id UUID PRIMARY KEY, " +
                    "expires_at TIMESTAMP(6) NOT NULL, " +
                    "email_or_phone VARCHAR(255) NOT NULL, " +
                    "otp_code_hash VARCHAR(255) NOT NULL, " +
                    "used BOOLEAN NOT NULL DEFAULT FALSE" +
                    ");";
            
            stmt.execute(createOtps);
            System.out.println("Table auth.otps created successfully.");
        }
    }
}
