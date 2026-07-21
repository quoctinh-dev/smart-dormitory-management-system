# --- Giai đoạn 1: Build ứng dụng với Maven ---
# Sử dụng một image base chứa Maven và JDK để build source code
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Thiết lập thư mục làm việc bên trong container
WORKDIR /app

# Copy file pom.xml trước để tận dụng Docker layer caching
# Nếu file pom.xml không đổi, Docker sẽ không cần tải lại dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy toàn bộ source code còn lại vào container
COPY src ./src

# Thực hiện build và đóng gói thành file .jar
# -DskipTests để bỏ qua việc chạy test trong quá trình build Docker image
RUN mvn package -DskipTests


# --- Giai đoạn 2: Chạy ứng dụng ---
# Sử dụng một image JRE (Java Runtime Environment) gọn nhẹ để chạy
FROM eclipse-temurin:17-jre

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file .jar đã được build từ giai đoạn 'build' vào image hiện tại
COPY --from=build /app/target/*.jar app.jar

# Thiết lập cổng mà ứng dụng sẽ chạy
EXPOSE 8080

# Câu lệnh để khởi chạy ứng dụng khi container bắt đầu
# ENTRYPOINT ["java", "-jar", "app.jar"]
# Thêm cấu hình timezone Việt Nam và các tùy chọn bộ nhớ để tối ưu hơn
ENTRYPOINT ["java", "-Duser.timezone=Asia/Ho_Chi_Minh", "-jar", "app.jar"]
