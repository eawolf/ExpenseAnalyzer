import java.sql.*;

public class CheckDb {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://localhost:5432/postgres";
        String user = "postgres";
        String password = "postgres123";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth'")) {
            
            System.out.println("Tables in 'auth' schema:");
            while (rs.next()) {
                System.out.println("- " + rs.getString("table_name"));
            }
        }
    }
}
