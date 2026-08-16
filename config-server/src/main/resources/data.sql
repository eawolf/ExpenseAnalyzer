DELETE FROM config.PROPERTIES;

-- Auth Service config.PROPERTIES
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('auth-service', 'default', 'master', 'server.port', '8081');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('auth-service', 'default', 'master', 'spring.datasource.url', 'jdbc:postgresql://localhost:5432/postgres');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('auth-service', 'default', 'master', 'spring.datasource.username', 'postgres');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('auth-service', 'default', 'master', 'spring.datasource.password', 'postgres123');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('auth-service', 'default', 'master', 'spring.datasource.driver-class-name', 'org.postgresql.Driver');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('auth-service', 'default', 'master', 'spring.jpa.hibernate.ddl-auto', 'update');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('auth-service', 'default', 'master', 'spring.jpa.show-sql', 'true');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('auth-service', 'default', 'master', 'spring.jpa.config.PROPERTIES.hibernate.dialect', 'org.hibernate.dialect.PostgreSQLDialect');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('auth-service', 'default', 'master', 'jwt.secret', '94a08da1fecbb6e8b46990538c7b50b2b80003b1d310619a8616149f1db71cf0');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('auth-service', 'default', 'master', 'jwt.expiration', '86400000');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('auth-service', 'default', 'master', 'spring.kafka.bootstrap-servers', 'localhost:9092');

-- Expense Service config.PROPERTIES
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('expense-service', 'default', 'master', 'server.port', '8080');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('expense-service', 'default', 'master', 'spring.datasource.url', 'jdbc:postgresql://localhost:5432/postgres');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('expense-service', 'default', 'master', 'spring.datasource.username', 'postgres');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('expense-service', 'default', 'master', 'spring.datasource.password', 'postgres123');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('expense-service', 'default', 'master', 'spring.datasource.driver-class-name', 'org.postgresql.Driver');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('expense-service', 'default', 'master', 'spring.jpa.hibernate.ddl-auto', 'update');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('expense-service', 'default', 'master', 'spring.jpa.show-sql', 'true');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('expense-service', 'default', 'master', 'spring.jpa.config.PROPERTIES.hibernate.dialect', 'org.hibernate.dialect.PostgreSQLDialect');
INSERT INTO config.PROPERTIES (APPLICATION, PROFILE, LABEL, KEY, VALUE) VALUES ('expense-service', 'default', 'master', 'jwt.secret', '94a08da1fecbb6e8b46990538c7b50b2b80003b1d310619a8616149f1db71cf0');
