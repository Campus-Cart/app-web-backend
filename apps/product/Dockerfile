# Use the official Rust image as a builder stage
FROM rust:latest as builder

# Update CA certificates and install protoc
RUN apt-get update && apt-get install -y \
    ca-certificates \
    protobuf-compiler \
    && update-ca-certificates

# Create a new empty shell project
RUN USER=root cargo new --bin product_microservice
WORKDIR /product_microservice

# Now that the dependencies are cached, copy the actual source code
COPY . .

# Install dependencies and build for release
RUN cargo install --path .

# Debugging step to list target directory contents
RUN ls -alh /usr/local/cargo/bin/

# The final stage
# Use Ubuntu as a base with a compatible GLIBC version
FROM ubuntu:latest
ARG APP=/usr/src/app

# Set the DATABASE_URL environment variable
ENV DATABASE_URL="postgresql://campuscart_1rbr_user:F7ohuceMztItYwLKaczgHqgpQXhLRYIN@dpg-cq5820g8fa8c7382tf90-a.oregon-postgres.render.com/campuscart_1rbr"

# Expose port 8080 if your application listens on this port
EXPOSE 8080

# Copy the compiled binary from the builder stage to the production image
COPY --from=builder /usr/local/cargo/bin/product-server ${APP}/product_server
COPY --from=builder /usr/local/cargo/bin/product-client ${APP}/product_client

WORKDIR ${APP}
ENTRYPOINT ["./product_server"]

# Specify the port binding for Render
CMD ["--port", "8080", "--host", "0.0.0.0"]






# # Use the official Rust image as a builder stage
# FROM rust:latest as builder

# # Update CA certificates
# RUN apt-get update && apt-get install -y \
#     ca-certificates \
#     protobuf-compiler \
#     && update-ca-certificates

# # Create a new empty shell project
# RUN USER=root cargo new --bin product_microservice
# WORKDIR /product_microservice

# # Now that the dependencies are cached, copy the actual source code
# COPY . .

# # Install dependencies and build for release
# RUN cargo install --path .

# # Debugging step to list target directory contents
# RUN ls -alh /usr/local/cargo/bin/

# # The final stage
# # Use Ubuntu as a base with a compatible GLIBC version
# FROM ubuntu:latest
# ARG APP=/usr/src/app

# # Set the DATABASE_URL environment variable
# ENV DATABASE_URL="postgresql://campuscart_1rbr_user:F7ohuceMztItYwLKaczgHqgpQXhLRYIN@dpg-cq5820g8fa8c7382tf90-a.oregon-postgres.render.com/campuscart_1rbr"

# # Expose port 8080 if your application listens on this port
# EXPOSE 8080

# # Copy the compiled binary from the builder stage to the production image
# COPY --from=builder /usr/local/cargo/bin/product_microservice ${APP}/product_microservice

# WORKDIR ${APP}
# ENTRYPOINT ["./product_microservice"]
