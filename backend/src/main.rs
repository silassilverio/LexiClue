use axum::{routing::{get, post}, Router};
use std::{net::SocketAddr, sync::Arc};
use tower_http::{cors::{Any, CorsLayer}, services::ServeDir};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod routes;

#[derive(Clone)]
pub struct AppState {
    pub groq_api_key: String,
    pub http_client: reqwest::Client,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load .env.local / .env from project root (local dev only — in prod use real env vars)
    let project_root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("backend/ must have a parent directory");
    for filename in &[".env.local", ".env"] {
        let path = project_root.join(filename);
        if path.exists() {
            dotenvy::from_path(&path).ok();
        }
    }
    dotenvy::dotenv().ok();

    let api_key = std::env::var("GROQ_API_KEY").expect("GROQ_API_KEY must be set");
    tracing::info!("GROQ_API_KEY loaded ({} chars)", api_key.len());

    let state = Arc::new(AppState {
        groq_api_key: api_key,
        http_client: reqwest::Client::new(),
    });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/api/words", post(routes::words::generate_words))
        .with_state(state)
        .layer(cors);

    // Serve compiled frontend if dist/ exists (production Docker build)
    let frontend_dist = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("frontend/dist");

    let app = if frontend_dist.exists() {
        tracing::info!("Serving frontend from {}", frontend_dist.display());
        app.fallback_service(ServeDir::new(frontend_dist).append_index_html_on_directories(true))
    } else {
        tracing::warn!("frontend/dist not found — API-only mode");
        app
    };

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("Listening on {addr}");

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
