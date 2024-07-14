#![allow(unused)]

use chrono::{ DateTime, TimeZone, Utc };
use clap::Parser;
use dotenv::dotenv;
use lazy_static::lazy_static;
use product::product_service_server::{ ProductService, ProductServiceServer };
use product::{
    CreateCategoryDto,
    CreateProductDto,
    Empty,
    FilterProductsDto,
    FindOneProductDto,
    PaginationDto,
    Product as PRODUCT,
    Products,
    SearchProductsRequest,
    SearchProductsResponse,
    UpdateProductDto,
};
use prost_types::Timestamp;
use sqlx::postgres::{ PgDatabaseError, PgPoolOptions, PgRow };
use sqlx::{ query, Executor, FromRow };
use sqlx::Row;
use std::env;
use std::fmt::format;
use std::net::AddrParseError;
use std::time::SystemTime;
use tonic::{ transport::Server, Request, Response, Status };
use uuid::Uuid;

fn timestamp_to_datetime(t: prost_types::Timestamp) -> DateTime<Utc> {
    Utc.timestamp_opt(t.seconds, t.nanos as u32).unwrap()
}

pub mod product {
    tonic::include_proto!("product");
}

#[derive(Debug)]
pub struct Product {
    pool: sqlx::Pool<sqlx::Postgres>,
}

impl Product {
    pub async fn new(pool: sqlx::Pool<sqlx::Postgres>) -> Self {
        Self { pool }
    }
}

lazy_static! {
    pub static ref DB_URL: String = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
}

#[tonic::async_trait]
impl ProductService for Product {
    async fn create_product(
        &self,
        request: Request<CreateProductDto>
    ) -> Result<Response<PRODUCT>, Status> {
        let req = request.into_inner();

        let id = Uuid::new_v4().to_string();
        let current_time = SystemTime::now();
        let timestamp = Timestamp::from(current_time);

        let product = PRODUCT {
            id: id.clone(),
            name: req.name.clone(),
            description: req.description.clone(),
            price: req.price.clone(),
            categories: req.categories.clone(),
            stock_quantity: req.stock_quantity.clone(),
            merchant_id: req.merchant_id.clone(),
            image_url: req.image_url.clone(),
            discount_id: req.discount_id.clone(),
            // created_at: Some(timestamp.clone()),
            // updated_at: Some(timestamp.clone()),
            // ..Default::default()
            page_number: Default::default(),
            page_size: Default::default(),
        };

        let timestamp = timestamp_to_datetime(timestamp);

        let row = sqlx
            ::query(
                r#"
                INSERT INTO product (id, name, description, price, categories, stock_quantity, merchant_id, image_url, discount_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id, name, description, price, categories, stock_quantity, merchant_id, image_url, discount_id
                "#
            )
            .bind(&id)
            .bind(&req.name)
            .bind(&req.description)
            .bind(&req.price)
            .bind(&req.categories)
            .bind(&req.stock_quantity)
            .bind(&req.merchant_id)
            .bind(&req.image_url)
            .bind(&req.discount_id)
            // .bind(&timestamp)
            // .bind(&timestamp)
            .execute(&self.pool).await;

        match row {
            Ok(_) => {
                let product = PRODUCT {
                    id,
                    name: req.name,
                    description: req.description,
                    price: req.price,
                    categories: req.categories,
                    stock_quantity: req.stock_quantity,
                    merchant_id: req.merchant_id,
                    image_url: req.image_url,
                    discount_id: req.discount_id,
                    // ..Default::default()
                    page_number: Default::default(),
                    page_size: Default::default(),
                };
                Ok(Response::new(product))
            }
            Err(e) => Err(Status::internal(format!("Failed to insert product: {}", e))),
        }

        // Ok(Response::new(product))
    }

    async fn update_product(
        &self,
        request: Request<UpdateProductDto>
    ) -> Result<Response<PRODUCT>, Status> {
        let req = request.into_inner();

        let current_time = SystemTime::now();
        let timestamp = Timestamp::from(current_time);

        let product = PRODUCT {
            id: req.id.clone(),
            name: req.name.clone(),
            description: req.description.clone(),
            price: req.price.clone(),
            categories: req.categories.clone(),
            stock_quantity: req.stock_quantity.clone(),
            merchant_id: req.merchant_id.clone(),
            image_url: req.image_url.clone(),
            discount_id: req.discount_id.clone(),
            // updated_at: Some(timestamp.clone()),
            ..Default::default()
        };

        let timestamp = timestamp_to_datetime(timestamp);

        let row = sqlx
            ::query(
                r#"
                UPDATE product
                SET name = $2, description = $3, price = $4, categories = $5, stock_quantity = $6, merchant_id = $7, image_url = $8, discount_id = $9
                WHERE id = $1
                RETURNING id, name, description, price, categories, stock_quantity, merchant_id, image_url, discount_id
                "#
            )
            .bind(&req.id)
            .bind(&req.name)
            .bind(&req.description)
            .bind(&req.price)
            .bind(&req.categories)
            .bind(&req.stock_quantity)
            .bind(&req.merchant_id)
            .bind(&req.image_url)
            .bind(&req.discount_id)
            // .bind(&timestamp)
            .execute(&self.pool).await;

        match row {
            Ok(_) => {
                let product = PRODUCT {
                    id: req.id,
                    name: req.name,
                    description: req.description,
                    price: req.price,
                    categories: req.categories,
                    stock_quantity: req.stock_quantity,
                    merchant_id: req.merchant_id,
                    image_url: req.image_url,
                    discount_id: req.discount_id,
                    // ..Default::default()
                    page_number: Default::default(),
                    page_size: Default::default(),
                };
                Ok(Response::new(product))
            }
            Err(e) => Err(Status::internal(format!("Failed to insert product: {}", e))),
        }
    }

    async fn find_all_products(
        &self,
        request: Request<Empty>
    ) -> Result<Response<Products>, Status> {
        let products = sqlx
            ::query(
                r#"
                SELECT id, name, description, price, categories, stock_quantity, merchant_id, image_url, discount_id
                FROM product
                "#
            )
            .fetch_all(&self.pool).await;
        match products {
            Ok(product_rows) => {
                let products: Vec<PRODUCT> = product_rows
                    .iter()
                    .map(|row| PRODUCT {
                        id: row.try_get("id").unwrap_or_default(),
                        name: row.try_get("name").unwrap_or_default(),
                        description: row.try_get("description").unwrap_or_default(),
                        price: row.try_get("price").unwrap_or_default(), // Ensure price is handled correctly as a decimal/float
                        categories: row.try_get("categories").unwrap_or_default(), // This might need special handling if it's an array
                        stock_quantity: row.try_get("stock_quantity").unwrap_or_default(),
                        merchant_id: row.try_get("merchant_id").unwrap_or_default(),
                        image_url: row.try_get("image_url").unwrap_or_default(),
                        discount_id: row.try_get("discount_id").unwrap_or_default(),
                        page_number: Default::default(),
                        page_size: Default::default(),
                    })
                    .collect();

                Ok(Response::new(Products { products }))
            }
            Err(e) => Err(Status::internal(format!("Failed to fetch products: {}", e))),
        }
    }

    async fn find_one_product(
        &self,
        request: Request<FindOneProductDto>
    ) -> Result<Response<PRODUCT>, Status> {
        let req = request.into_inner();

        let product = sqlx
            ::query(
                r#"
                SELECT id, name, description, price, categories, stock_quantity, merchant_id, image_url, discount_id
                FROM product
                WHERE id = $1
                "#
            )
            .bind(&req.id)
            .fetch_one(&self.pool).await;

        match product {
            Ok(row) => {
                let product = PRODUCT {
                    id: row.try_get("id").unwrap_or_default(),
                    name: row.try_get("name").unwrap_or_default(),
                    description: row.try_get("description").unwrap_or_default(),
                    price: row.try_get("price").unwrap_or_default(),
                    categories: row.try_get("categories").unwrap_or_default(),
                    stock_quantity: row.try_get("stock_quantity").unwrap_or_default(),
                    merchant_id: row.try_get("merchant_id").unwrap_or_default(),
                    image_url: row.try_get("image_url").unwrap_or_default(),
                    discount_id: row.try_get("discount_id").unwrap_or_default(),
                    page_number: Default::default(),
                    page_size: Default::default(),
                };

                Ok(Response::new(product))
            }
            Err(e) => Err(Status::internal(format!("Failed to fetch product: {}", e))),
        }
    }

    async fn remove_product(
        &self,
        request: Request<FindOneProductDto>
    ) -> Result<Response<Empty>, Status> {
        let req = request.into_inner();

        let result = sqlx
            ::query(
                r#"
            DELETE FROM product
            WHERE id = $1
            RETURNING id
            "#
            )
            .bind(&req.id)
            .fetch_optional(&self.pool).await; // Using fetch_optional in case the id does not exist

        match result {
            Ok(Some(row)) => {
                // If the query succeeded and a row was returned, the product was deleted
                Ok(Response::new(Empty {})) // Return an empty response as typically done for DELETE operations
            }
            Ok(None) => {
                // If no row returned, the product did not exist
                Err(Status::not_found(format!("Product with ID {} not found", req.id)))
            }
            Err(e) => {
                // If there was a database error
                Err(Status::internal(format!("Failed to remove product: {}", e)))
            }
        }
    }

    async fn get_paginated_products(
        &self,
        request: Request<PaginationDto>
    ) -> Result<Response<Products>, Status> {
        let req = request.into_inner();

        let products = sqlx
            ::query(
                r#"
                SELECT id, name, description, price, categories, stock_quantity, merchant_id, image_url, discount_id
                FROM product
                LIMIT $1 OFFSET $2
                "#
            )
            .bind(req.page_size)
            .bind(req.page_number)
            .fetch_all(&self.pool).await;

        match products {
            Ok(product_rows) => {
                let products: Vec<PRODUCT> = product_rows
                    .iter()
                    .map(|row| PRODUCT {
                        id: row.try_get("id").unwrap_or_default(),
                        name: row.try_get("name").unwrap_or_default(),
                        description: row.try_get("description").unwrap_or_default(),
                        price: row.try_get("price").unwrap_or_default(),
                        categories: row.try_get("categories").unwrap_or_default(),
                        stock_quantity: row.try_get("stock_quantity").unwrap_or_default(),
                        merchant_id: row.try_get("merchant_id").unwrap_or_default(),
                        image_url: row.try_get("image_url").unwrap_or_default(),
                        discount_id: row.try_get("discount_id").unwrap_or_default(),
                        page_number: Default::default(),
                        page_size: Default::default(),
                    })
                    .collect();

                Ok(Response::new(Products { products }))
            }
            Err(e) => Err(Status::internal(format!("Failed to fetch products: {}", e))),
        }
    }

    async fn search_products(
        &self,
        request: Request<SearchProductsRequest>
    ) -> Result<Response<SearchProductsResponse>, Status> {
        let req = request.into_inner();

        let query = format!("%{}%", req.query.clone().unwrap_or_default());
        let products = sqlx
            ::query(
                r#"
                SELECT id, name, description, price, categories, stock_quantity, merchant_id, image_url, discount_id
                FROM product
                WHERE name ILIKE $1
                LIMIT $2 OFFSET $3
                "#
            )
            .bind(&req.query)
            .bind(req.page_size)
            .bind((req.page_number - 1) * req.page_size)
            .fetch_all(&self.pool)
            .await;
            // .map_err(|e| Status::internal("Failed to execute query"))?;
            match products {
                Ok(product_rows) => {
                    let products: Vec<PRODUCT> = product_rows
                        .iter()
                        .map(|row| PRODUCT {
                            id: row.try_get("id").unwrap_or_default(),
                            name: row.try_get("name").unwrap_or_default(),
                            description: row.try_get("description").unwrap_or_default(),
                            price: row.try_get("price").unwrap_or_default(),
                            categories: row.try_get("categories").unwrap_or_default(),
                            stock_quantity: row.try_get("stock_quantity").unwrap_or_default(),
                            merchant_id: row.try_get("merchant_id").unwrap_or_default(),
                            image_url: row.try_get("image_url").unwrap_or_default(),
                            discount_id: row.try_get("discount_id").unwrap_or_default(),
                            page_number: Default::default(),
                            page_size: Default::default(),
                        })
                        .collect();

                    Ok(Response::new(SearchProductsResponse { products }))
                }
                Err(e) => Err(Status::internal(format!("Failed to fetch products: {}", e))),
            }
    }
}

#[derive(Parser)]
#[command(author, version)]
#[command(about = "product-server - the product microservice", long_about = None)]
struct ServerCli {
    #[arg(short = 's', long = "server", default_value = "127.0.0.1")]
    server: String,
    #[arg(short = 'p', long = "port", default_value = "50052")]
    port: u16,
}

#[tokio::main]
async fn main() -> Result<(), sqlx::Error> {
    dotenv().ok();

    // let cli = ServerCli::parse();
    // let addr = format!("{}:{}", cli.server, cli.port).parse()?;
    // let product_service = Product::default();

    // Create a connection pool
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&DB_URL).await
        .expect("Failed to create pool");

    // Create table if not exist yet
    sqlx
        ::query(
            r#"
        CREATE TABLE IF NOT EXISTS product (
            id VARCHAR PRIMARY KEY,
            name VARCHAR NOT NULL,
            description VARCHAR NOT NULL,
            price DECIMAL NOT NULL,
            categories VARCHAR[] NOT NULL,
            stock_quantity INT NOT NULL,
            merchant_id VARCHAR NOT NULL,
            image_url VARCHAR NOT NULL,
            discount_id VARCHAR NOT NULL
        );
        "#
        )
        .execute(&pool).await?;
    sqlx
        ::query(
            r#"
        CREATE TABLE IF NOT EXISTS category (
            id VARCHAR PRIMARY KEY,
            name VARCHAR NOT NULL,
            description VARCHAR NOT NULL,
            products JSONB[]
        )
        "#
        )
        .execute(&pool).await?;

    // Start the server
    let cli = ServerCli::parse();
    let addr = format!("{}:{}", cli.server, cli.port).parse();
    // Handle AddrParseError here
    let addr = match addr {
        Ok(addr) => addr,
        Err(err) => {
            return Err(
                sqlx::Error::Io(
                    std::io::Error::new(
                        std::io::ErrorKind::InvalidInput,
                        format!("Failed to parse address: {}", err)
                    )
                )
            );
        }
    };
    let product_service = Product::new(pool).await;

    println!("Server listening on {}", addr);

    Server::builder().add_service(ProductServiceServer::new(product_service)).serve(addr).await;

    Ok(())
}
