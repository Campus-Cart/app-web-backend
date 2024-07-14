// use ::clap::Parser;
// use product::product_service_server::{ProductService, ProductServiceServer};
// use product::{
//     CreateProductDto, Empty, FilterProductsDto, FindOneProductDto, Product as PRODUCT, Products,
//     UpdateProductDto, CreateCategoryDto,
// };
// use prost_types::Timestamp;
// use sqlx::postgres::PgPoolOptions;
// use sqlx::FromRow;
// use std::time::SystemTime;
// use tonic::{transport::Server, Request, Response, Status};
// use uuid::Uuid;

// pub mod product {
//     tonic::include_proto!("product");
// }

// #[derive(Debug)]
// pub struct Product {
//     pool: sqlx::Pool<sqlx::Postgres>,
// }

// impl Product {
//     pub async fn new(pool: sqlx::Pool<sqlx::Postgres>) -> Self {
//         // let database_url = "postgresql://user:password@localhost/mydb";
//         // let pool = PgPoolOptions::new().connect(&database_url).await.unwrap();
//         Self { pool }
//     }
// }

// #[tonic::async_trait]
// impl ProductService for Product {
//     async fn create_product(
//         &self,
//         request: Request<CreateProductDto>,
//     ) -> Result<Response<PRODUCT>, Status> {
//         let req = request.into_inner();

//         let id = Uuid::new_v4().to_string();
//         let currentTime = SystemTime::now();
//         let timestamp = Timestamp::from(currentTime);

//         let product = PRODUCT {
//             id: id.clone(),
//             name: req.name.clone(),
//             description: req.description.clone(),
//             price: req.price.clone(),
//             categories: req.categories.clone(),
//             stock_quantity: req.stock_quantity.clone(),
//             merchant_id: req.merchant_id.clone(),
//             image_url: req.image_url.clone(),
//             discount_id: req.discount_id.clone(),
//             created_at: Some(timestamp.clone()),
//             updated_at: Some(timestamp.clone()),
//             ..Default::default()
//         };

//         sqlx::query!(
//             r#"
//             INSERT INTO product (id, name, description, price, categories, stock_quantity, merchant_id, image_url, discount_id, created_at, updated_at)"
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
//             "#,
//             id, req.name, req.description, req.price, req.categories, req.stock_quantity, req.merchant_id, req.image_url, req.discount_id, timestamp, timestamp
//         )
//         .execute(&self.pool)
//         .await?;

//         Ok(Response::new(product))
//     }

//     async fn find_all_products(
//         &self,
//         _request: Request<Empty>,
//     ) -> Result<Response<Products>, Status> {
//         let products = sqlx::query!(
//             r#"
//             SELECT * FROM product
//             "#
//         )
//         .fetch_all(&self.pool)
//         .await?;

//         let mut products_list = Vec::new();

//         for product in products {
//             let product = PRODUCT {
//                 id: product.id,
//                 name: product.name,
//                 description: product.description,
//                 price: product.price,
//                 categories: product.categories,
//                 stock_quantity: product.stock_quantity,
//                 merchant_id: product.merchant_id,
//                 image_url: product.image_url,
//                 discount_id: product.discount_id,
//                 created_at: product.created_at,
//                 updated_at: product.updated_at,
//                 ..Default::default()
//             };
//             products_list.push(product);
//         }

//         Ok(Response::new(Products {
//             products: products_list,
//         }))
//     }

//     async fn update_product(
//         &self,
//         request: Request<UpdateProductDto>,
//     ) -> Result<Response<PRODUCT>, Status> {
//         let req = request.into_inner();

//         let currentTime = SystemTime::now();
//         let timestamp = Timestamp::from(currentTime);

//         let product = sqlx::query!(
//             r#"
//             UPDATE product
//             SET name = $2, description = $3, price = $4, categories = $5, stock_quantity = $6, merchant_id = $7, image_url = $8, discount_id = $9, updated_at = $10
//             WHERE id = $1
//             RETURNING *
//             "#,
//             req.id, req.name, req.description, req.price, req.categories, req.stock_quantity, req.merchant_id, req.image_url, req.discount_id, timestamp
//         )
//         .fetch_one(&self.pool)
//         // .execute(&self.pool)
//         .await?;

//         let product = PRODUCT {
//             id: product.id,
//             name: product.name,
//             description: product.description,
//             price: product.price,
//             categories: product.categories,
//             stock_quantity: product.stock_quantity,
//             merchant_id: product.merchant_id,
//             image_url: product.image_url,
//             discount_id: product.discount_id,
//             created_at: product.created_at,
//             updated_at: product.updated_at,
//             ..Default::default()
//         };

//         Ok(Response::new(product))
//     }

//     async fn find_many_products(
//         &self,
//         request: Request<FilterProductsDto>,
//     ) -> Result<Response<Products>, Status> {
//         let req = request.into_inner();

//         let mut query = String::from("SELECT * FROM products WHERE ");
//         let mut float_params = Vec::new();
//         let mut string_params = Vec::new();

//         if req.min_price > 0.0 && req.max_price > 0.0 {
//             query.push_str("price BETWEEN $1 and $2");
//             float_params.push(req.min_price);
//             float_params.push(req.max_price);
//         }

//         if !req.categories.is_empty() {
//             if !float_params.is_empty() {
//                 query.push_str("AND ");
//             }
//             query.push_str("categories = ANY($3) ");
//             string_params.push(req.categories.join(","))
//         }

//         #[derive(FromRow)]
//         struct PRODUCT {
//             id: String,
//             name: String,
//             description: String,
//             price: f32,
//             categories: Vec<String>,
//             stock_quantity: i32,
//             merchant_id: String,
//             image_url: String,
//             discount_id: String,
//             created_at: String,
//             updated_at: String,
//         }

//         if !req.merchant_id.is_empty() {
//             if !float_params.is_empty() {
//                 query.push_str("AND ");
//             }
//             query.push_str("merchant_id = $4 ");
//             string_params.push(req.merchant_id);
//         }

//         query.push_str("LIMIT $5 OFFSET $6");
//         float_params.push(req.page_size as f32);
//         float_params.push((req.page_number * req.page_size) as f32);

//         let products = sqlx::query_as::<_, PRODUCT>(&query)
//             .bind(float_params)
//             .bind(string_params)
//             .fetch_all(&self.pool)
//             .await
//             .map_err(|e| {
//                 println!("Error executing query: {:?}", e);
//                 Status::internal("Internal Server Error")
//             })?;

//         Ok(Response::new(Products {products}))
//     }

//     async fn find_one_product(
//         &self,
//         request: Request<FindOneProductDto>,
//     ) -> Result<Response<PRODUCT>, Status> {
//         let req = request.into_inner();
//         let product = sqlx::query!(
//             r#"
//             SELECT * FROM product
//             WHERE id = $1
//             "#,
//             req.id
//         )
//         .fetch_one(&self.pool)
//         .await?;

//         Ok(Response::new(product))
//     }

//     async fn remove_product(
//         &self,
//         request: Request<FindOneProductDto>,
//     ) -> Result<Response<Empty>, Status> {
//         let req = request.into_inner();
//         let result = sqlx::query!(
//             r#"
//             DELETE FROM product
//             WHERE id = $1
//             RETURNING *
//             "#,
//             req.id
//         )
//         .fetch_optional(&self.pool)
//         .await?;

//         if let Some(_) = result {
//             Ok(Response::new(Empty {}))
//         } else {
//             Err(Status::not_found("Product not found"))
//         }
//     }

//     async fn add_category_by_product(
//         &self,
//         request: Request<CreateCategoryDto>,
//     ) -> Result<Response<Empty>, Status> {
//         let req = request.into_inner();

//         // Check if the product exists
//         let product = sqlx::query!(
//             "SELECT * FROM product
//             WHERE id = $1",
//             req.product_id
//         )
//         .fetch_optional(&self.pool)
//         .await?;

//         if let Some(_) = product {
//             // Check if the category exists (assuming you have a `Category` table)
//             let category = sqlx::query!(
//                 "SELECT * FROM category
//                 WHERE id = $1",
//                 req.id
//             )
//                 .fetch_optional(&self.pool)
//                 .await?;

//             if let Some(_) = category {
//                 // Update the product's categories
//                 sqlx::query!(
//                     "UPDATE product
//                     SET categories = array_append(categories, $1) WHERE id = $2",
//                     req.id,
//                     req.product_id
//                 )
//                 .execute(&self.pool)
//                 .await?;

//                 Ok(Response::new(Empty {}))
//             } else {
//                 Err(Status::not_found(format!(
//                     "Category with id {} not found",
//                     req.id
//                 )))
//             }
//         } else {
//             Err(Status::not_found(format!("Product with id {} not found", req.product_id)))
//         }
//     }
// }

// #[derive(Parser)]
// #[command(author, version)]
// #[command(about = "product-server - the product microservice", long_about = None)]
// struct ServerCli {
//     #[arg(short = 's', long = "server", default_value = "127.0.0.1")]
//     server: String,
//     #[arg(short = 'p', long = "port", default_value = "50052")]
//     port: u16,
// }

// #[tokio::main]
// async fn main() -> Result<(), Box<dyn std::error::Error>> {
//     let pool = PgPoolOptions::new()
//     .max_connections(5)
//     .connect("postgres://campuscart_s5uh_user:hrxYEAQhib9emvqCEe0Wi914xkSaq68t@dpg-co065lda73kc73catd20-a.oregon-postgres.render.com/campuscart_s5uh")
//     .await?;

//     // Initialize the Product service with the connection pool
//     // let product_service = Product::new(pool);

//     sqlx::query!(
//         r#"
//         CREATE TABLE IF NOT EXISTS product (
//             id VARCHAR PRIMARY KEY,
//             name VARCHAR NOT NULL,
//             description VARCHAR NOT NULL,
//             price DECIMAL NOT NULL,
//             categories VARCHAR[] NOT NULL,
//             stock_quantity INT NOT NULL,
//             merchant_id VARCHAR NOT NULL,
//             image_url VARCHAR NOT NULL,
//             discount_id VARCHAR NOT NULL,
//             created_at TIMESTAMP NOT NULL,
//             updated_at TIMESTAMP NOT NULL
//         )
//         "#
//     )
//     .execute(&pool)
//     .await?;

//     // Start the server
//     let addr = "[::1]:50051".parse().unwrap();
//     let product_service = Product::new(pool).await;
//     Server::builder()
//         .add_service(ProductServiceServer::new(product_service))
//         .serve(addr)
//         .await?;

//     Ok(())
// }

#[derive(Parser)]
#[command(author, version)]
#[command(about = "echo - a simple CLI to send messages to a server", long_about = None)]
struct ClientCli {
    #[arg(short = 's', long = "server", default_value = "127.0.0.1")]
    server: String,
    #[arg(short = 'p', long = "port", default_value = "50052")]
    port: u16,
    /// The message to send
    message: Option<String>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = ClientCli::parse();

    let mut client =
        ProductServiceClient::connect(format!("http://{}:{}", cli.server, cli.port)).await?;
    // Import the necessary module

    let request = tonic::Request::new(CreateProductDto {
        name: "Example Product Name".to_string(),
        description: "Example Product Description".to_string(),
        price: 10.99, // Example price
        categories: vec!["Category1".to_string(), "Category2".to_string()], // Example categories
        stock_quantity: 100, // Example stock quantity
        merchant_id: "example_merchant_id".to_string(), // Example merchant ID
        image_url: "http://example.com/image.jpg".to_string(), // Example image URL
        discount_id: "example_discount_id".to_string(), // Example discount ID
    });

    let response = client.create_product(request).await?;

    //println!("RESPONSE={:?}", response.into_inner().name);
    println!("RESPONSE={:?}", response.into_inner());

    Ok(())
}

// use clap::Parser;
// use actix_web::{web, App, HttpResponse, HttpServer, Responder};
// use product::product_service_client::ProductServiceClient;
// use tonic::{client, transport::Channel};
// use tonic::Request;
// use product::{
//     CreateCategoryDto, CreateProductDto, Empty, FilterProductsDto, FindOneProductDto,
//     Product as PRODUCT, Products, UpdateProductDto,
// };
// use actix_web::{delete, get, post, put};

// pub mod product {
//     tonic::include_proto!("product");
// }

// #[derive(Parser)]
// #[command(author, version)]
// #[command(about = "echo - a simple CLI to send messages to a server", long_about = None)]
// struct ClientCli {
//     #[arg(short = 's', long = "server", default_value = "127.0.0.1")]
//     server: String,
//     #[arg(short = 'p', long = "port", default_value = "50052")]
//     port: u16,
//     /// The message to send
//     message: Option<String>,
// }

// async fn create_product(
//     client: &mut ProductServiceClient<Channel>,
//     dto: CreateProductDto,
// ) -> Result<HttpResponse, Box<dyn std::error::Error>> {
//     let request = tonic::Request::new(dto);
//     let response = client.create_product(request).await?;
//     Ok(HttpResponse::Ok().body(format!("RESPONSE={:?}", response.into_inner())))
// }

// #[tokio::main]
// // #[actix_rt::main]
// async fn main() -> Result<(), Box<dyn std::error::Error>> {
//     let cli = ClientCli::parse();
//     let mut client =
//         ProductServiceClient::connect(format!("http://{}:{}", cli.server, cli.port)).await?;

//     HttpServer::new(|| {
//         App::new()
//             .route("/product", web::post().to(move |dto: web::Json<CreateProductDto> | {
//                 let client = client.clone();
//                 async move {
//                     match create_product(&mut client, dto.into_inner()).await {
//                         Ok(response) => response,
//                         Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
//                     }
//                 }
//             }))
//     })
//     .bind(format!("{}:{}", cli.server, cli.port))?
//     .run()
//     .await;
//     Ok(())
// }

// use actix_web::{web, App, HttpResponse, HttpServer};
// use product::product_service_client::ProductServiceClient;
// use product::{CreateProductDto, Product as PRODUCT};
// use serde::ser::{Serialize, Serializer, SerializeStruct};
// use chrono::{DateTime, TimeZone, Utc};
// use prost_types::Timestamp;
// use tonic::Request;
// // use serde::Serialize;
// use serde_derive::{Deserialize, Serialize};

// // struct SerializableTimestamp(Timestamp);

// // impl Serialize for SerializableTimestamp {
// //     fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
// //     where
// //         S: Serializer,
// //     {
// //         let mut state = serializer.serialize_struct("Timestamp", 2)?;
// //         state.serialize_field("seconds", &self.0.seconds)?;
// //         state.serialize_field("nanos", &self.0.nanos)?;
// //         state.end()
// //     }
// // }

// pub mod product {
//     tonic::include_proto!("product");
// }

// #[derive(Debug, Serialize, Deserialize)]
// pub struct Product {
//     pub id: String,
//     pub name: String,
//     pub description: String,
//     pub price: f64,
//     pub categories: Vec<String>,
//     pub stock_quantity: i32,
//     pub merchant_id: String,
//     pub image_url: String,
//     pub discount_id: String,
//     // pub created_at: Timestamp,
//     // pub updated_at: Timestamp,
//     pub page_size: i32,
//     pub page_number: i32,
// }

// async fn create_product(
//     client: &mut ProductServiceClient<tonic::transport::Channel>,
//     dto: CreateProductDto,
// ) -> Result<HttpResponse, tonic::Status> {
//     let request = Request::new(dto);
//     let response = client.create_product(request).await?;
//     Ok(HttpResponse::Ok().json(response.into_inner()))
// }

// #[actix_web::main]
// async fn main() -> std::io::Result<()> {
//     let mut client = ProductServiceClient::connect("http://127.0.0.1:50052")
//         .await
//         .unwrap();

//     HttpServer::new(|| {
//         App::new().route(
//             "/product",
//             web::post().to(move |dto: web::Json<CreateProductDto>| {
//                 let mut client = client.clone();
//                 async move {
//                     match create_product(&mut client, dto.into_inner()).await {
//                         Ok(response) => response,
//                         Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
//                     }
//                 }
//             }),
//         )
//     })
//     .bind("127.0.0.1:8080")?
//     .run()
//     .await
// }

// #[derive(Debug, Deserialize)]
// struct RequestMessage {
//     // Define the fields of the request message
//     // Example: field1: String,
// }

// async fn handle_post_request(message: web::Json<RequestMessage>) -> HttpResponse {
//     // Extract the request message from Postman
//     let request_message = message.into_inner();
//     // Process the request message
//     // Example: println!("Received request message: {:?}", request_message);

//     // Return a response
//     HttpResponse::Ok().finish()
// }

// #[actix_web::main]
// async fn main() -> std::io::Result<()> {
//     HttpServer::new(|| {
//         App::new().service(web::resource("/endpoint").route(web::post().to(handle_post_request)))
//     })
//     .bind("127.0.0.1:8080")?
//     .run()
//     .await
// }

//  // Create a product
//  let create_product_request = tonic::Request::new(CreateProductDto {
//     name: "Product Name".to_string(),
//     description: "Product Description".to_string(),
//     price: 10.0,
//     categories: vec!["Category1".to_string(), "Category2".to_string()],
//     stock_quantity: 100,
//     merchant_id: "MerchantID".to_string(),
//     image_url: "https://example.com/image.png".to_string(),
//     discount_id: "DiscountID".to_string(),
// });

// let response = client.create_product(create_product_request).await?;
// println!("Created product: {:?}", response.into_inner());

// // Update a product
// let update_product_request = tonic::Request::new(UpdateProductDto {
//     id: "ProductID".to_string(),
//     name: "Updated Product Name".to_string(),
//     description: "Updated Product Description".to_string(),
//     price: 20.0,
//     categories: vec![
//         "Updated Category1".to_string(),
//         "Updated Category2".to_string(),
//     ],
//     stock_quantity: 200,
//     merchant_id: "Updated MerchantID".to_string(),
//     image_url: "https://example.com/updated_image.png".to_string(),
//     discount_id: "Updated DiscountID".to_string(),
// });

// let response = client.update_product(update_product_request).await?;
// println!("Updated product: {:?}", response.into_inner());

// let products = vec![
//     PRODUCT {
//         id: "test-id".to_string(),
//         name: "Test Product".to_string(),
//         description: "A test product".to_string(),
//         price: 19.99,
//         categories: vec!["Test Category".to_string()],
//         stock_quantity: 100,
//         merchant_id: "test-merchant-id".to_string(),
//         image_url: "http://example.com/test.jpg".to_string(),
//         discount_id: "test-discount-id".to_string(),
//         page_number: Default::default(),
//         page_size: Default::default(),
//     },
// ];
// Ok(Response::new(Products { products }))

// match products {
//     Ok(products) => {
//         let products = products
//             .iter()
//             .map(|row| {
//                 PRODUCT {
//                     id: row.get(0),
//                     name: row.get(1),
//                     description: row.get(2),
//                     price: row.get(3),
//                     categories: row.get(4),
//                     stock_quantity: row.get(5),
//                     merchant_id: row.get(6),
//                     image_url: row.get(7),
//                     discount_id: row.get(8),
//                     // ..Default::default()
//                     page_number: Default::default(),
//                     page_size: Default::default(),
//                 }
//             })
//             .collect();

//         Ok(Response::new(Products { products }))
//     }
//     Err(e) => Err(Status::internal(format!("Failed to fetch products: {}", e))),
// }

// let server = HttpServer::new(move || {
//     let client_data = web::Data::new(client.clone());

//     let cors = Cors::builder()
//         .allowed_origin("http://example.com")
//         .allowed_methods(vec!["GET", "POST"])
//         .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
//         .allowed_header(http::header::CONTENT_TYPE)
//         .max_age(3600)
//         .finish();

//     App::new()
//         .wrap(cors)
//         .app_data(client_data)
//         .route("/product", web::post().to(handle_create_product))
//         .route("/product/{id}", web::patch().to(handle_update_product))
//         .route("/product", web::get().to(handle_find_all_products))
//         .route("/product/{id}", web::get().to(handle_find_one_product))
//         .route("/product/{id}", web::delete().to(handle_remove_product))
//         .route("/product/{page_number}/{page_size}", web::get().to(handle_get_paginated))
// })
// .bind("127.0.0.1:8082")?
// .run()
// .await?;
