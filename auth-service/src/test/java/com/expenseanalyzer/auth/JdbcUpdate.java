package com.expenseanalyzer.auth;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class JdbcUpdate {
    public static void main(String[] args) {
        try {
            Class.forName("org.postgresql.Driver");
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/postgres", "postgres", "postgres123");
            Statement stmt = conn.createStatement();
            stmt.execute("ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS currency VARCHAR(255) DEFAULT '$';");
            System.out.println("Column added successfully.");
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
