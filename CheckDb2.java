import java.sql.*;

public class CheckDb2 {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://localhost:5432/expense_analyzer";
        String user = "postgres";
        String password = "postgres123";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth'")) {
            
            System.out.println("Tables in expense_analyzer 'auth' schema:");
            while (rs.next()) {
                System.out.println("- " + rs.getString("table_name"));
            }
        }
    }
}
