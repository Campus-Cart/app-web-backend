#![allow(unused)]
use actix_web::{ web, App, HttpResponse, HttpServer, Responder, ResponseError };
use clap::Parser;
use env_logger::Env;
use product::product_service_client::ProductServiceClient;
use product::{
    CreateProductDto,
    Product,
    UpdateProductDto,
    Empty,
    SearchProductsResponse,
    SearchProductsRequest,
};
use serde::{ Deserialize, Serialize };
use std::env;
use std::net::SocketAddr;
use tonic::Request;
use tonic::{ client, transport::Channel };
use actix_cors::Cors;

pub mod product {
    tonic::include_proto!("product");
}

#[derive(Parser)]
#[command(author, version)]
#[command(about = "Product ", long_about = None)]
struct ClientCli {
    #[arg(short = 's', long = "server", default_value = "0.0.0.0")]
    server: String,
    #[arg(short = 'p', long = "port", default_value = "50052")]
    port: u16,
    /// The message to send
    message: Option<String>,
}

#[derive(Debug)]
enum MyError {
    NotFound,
    BadRequest(String),
    InternalServerError(String),
}

impl std::fmt::Display for MyError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match *self {
            MyError::NotFound => write!(f, "Not found"),
            MyError::BadRequest(ref message) => write!(f, "Bad request: {}", message),
            MyError::InternalServerError(ref message) => {
                write!(f, "Internal server error: {}", message)
            }
        }
    }
}

impl ResponseError for MyError {
    fn error_response(&self) -> HttpResponse {
        match *self {
            MyError::NotFound => HttpResponse::NotFound().finish(),
            MyError::BadRequest(ref message) => HttpResponse::BadRequest().body(message.clone()),
            MyError::InternalServerError(ref message) => {
                HttpResponse::InternalServerError().body(message.clone())
            }
        }
    }
}

async fn create_product(
    client: &mut ProductServiceClient<Channel>,
    dto: CreateProductDto
) -> Result<Product, tonic::Status> {
    let request = Request::new(dto);
    let response = client.create_product(request).await?;
    Ok(response.into_inner())
}

async fn update_product(
    client: &mut ProductServiceClient<Channel>,
    dto: UpdateProductDto
) -> Result<Product, tonic::Status> {
    let request = Request::new(dto);
    let response = client.update_product(request).await?;
    Ok(response.into_inner())
}

async fn find_all_products(
    client: &mut ProductServiceClient<Channel>
) -> Result<Vec<Product>, tonic::Status> {
    let request = Request::new(product::Empty {});
    let response = client.find_all_products(request).await?;
    Ok(response.into_inner().products)
}

async fn find_one_product(
    client: &mut ProductServiceClient<Channel>,
    id: String
) -> Result<Product, tonic::Status> {
    let request = Request::new(product::FindOneProductDto { id });
    let response = client.find_one_product(request).await?;
    Ok(response.into_inner())
}

async fn remove_product(
    client: &mut ProductServiceClient<Channel>,
    id: String
) -> Result<Empty, tonic::Status> {
    let request = Request::new(product::FindOneProductDto { id });
    let response = client.remove_product(request).await;
    match response {
        Ok(res) => Ok(res.into_inner()), // Extract the inner Empty type from the Response
        Err(e) => Err(e), // Propagate the error as is
    }
}

async fn get_paginated_products(
    client: &mut ProductServiceClient<Channel>,
    page_number: i32,
    page_size: i32
) -> Result<Vec<Product>, tonic::Status> {
    let request = Request::new(product::PaginationDto { page_number, page_size });
    let response = client.get_paginated_products(request).await?;
    Ok(response.into_inner().products)
}

async fn search_products(
    client: &mut ProductServiceClient<Channel>,
    query: SearchProductsRequest
) -> Result<SearchProductsResponse, tonic::Status> {
    let request = Request::new(query);
    let response = client.search_products(request).await?;
    Ok(response.into_inner())
}

// Functions to handle the service functions
async fn handle_create_product(
    dto: web::Json<CreateProductDto>,
    client: web::Data<ProductServiceClient<Channel>>
) -> impl Responder {
    match create_product(&mut client.get_ref().clone(), dto.into_inner()).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

async fn handle_update_product(
    id: web::Path<String>,
    dto: web::Json<UpdateProductDto>,
    client: web::Data<ProductServiceClient<Channel>>
) -> impl Responder {
    let dto = UpdateProductDto {
        id: id.into_inner(),
        ..dto.into_inner()
    };
    match update_product(&mut client.get_ref().clone(), dto).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

async fn handle_find_all_products(
    client: web::Data<ProductServiceClient<Channel>>
) -> impl Responder {
    match find_all_products(&mut client.get_ref().clone()).await {
        // Ok(response) => HttpResponse::Ok().json(response),
        Ok(response) => Ok(HttpResponse::Ok().json(response)),
        Err(_) => Err(MyError::InternalServerError("Failed to find all products".to_string())),
        // Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

async fn handle_find_one_product(
    id: web::Path<String>,
    client: web::Data<ProductServiceClient<Channel>>
) -> impl Responder {
    match find_one_product(&mut client.get_ref().clone(), id.into_inner()).await {
        // Ok(response) => HttpResponse::Ok().json(response),
        // Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
        Ok(response) => Ok(HttpResponse::Ok().json(response)),
        Err(_) => Err(MyError::InternalServerError("Failed to find one product".to_string())),
    }
}

async fn handle_remove_product(
    id: web::Path<String>,
    client: web::Data<ProductServiceClient<Channel>>
) -> impl Responder {
    match remove_product(&mut client.get_ref().clone(), id.into_inner()).await {
        Ok(response) => Ok(HttpResponse::Ok().json(response)),
        Err(_) => Err(MyError::InternalServerError("Failed to delete product".to_string())),
    }
}

async fn handle_get_paginated(
    page_number: web::Path<i32>,
    page_size: web::Path<i32>,
    client: web::Data<ProductServiceClient<Channel>>
) -> impl Responder {
    match
        get_paginated_products(
            &mut client.get_ref().clone(),
            page_number.into_inner(),
            page_size.into_inner()
        ).await
    {
        Ok(response) => Ok(HttpResponse::Ok().json(response)),
        Err(_) => Err(MyError::InternalServerError("Failed to get paginated products".to_string())),
    }
}

async fn handle_search_products(
    query: web::Query<SearchProductsRequest>,
    client: web::Data<ProductServiceClient<Channel>>
) -> impl Responder {
    match search_products(&mut client.get_ref().clone(), query.into_inner()).await {
        Ok(response) => Ok(HttpResponse::Ok().json(response)),
        Err(_) => Err(MyError::InternalServerError("Failed to search products".to_string())),
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr: SocketAddr = format!("0.0.0.0:{}", port).parse()?;

    env::set_var("RUST_LOG", "debug");
    env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();
    
    let cli = ClientCli::parse();

    let client = ProductServiceClient::connect(format!("http://{}:{}", cli.server, cli.port)).await?;

    let server = HttpServer::new(move || {
        let client_data = web::Data::new(client.clone());

        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .app_data(client_data)
            .service(web::resource("/search").route(web::get().to(handle_search_products)))
            .route("/product", web::post().to(handle_create_product))
            .route("/product/{id}", web::patch().to(handle_update_product))
            .route("/product", web::get().to(handle_find_all_products))
            .route("/product/{id}", web::get().to(handle_find_one_product))
            .route("/product/{id}", web::delete().to(handle_remove_product))
            .route("/product/{page_number}/{page_size}", web::get().to(handle_get_paginated))
    })
    .bind(addr)?
    .run()
    .await?;

    Ok(())
}
