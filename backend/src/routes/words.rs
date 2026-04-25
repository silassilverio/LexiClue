use axum::{extract::State, http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};

use crate::AppState;

#[derive(Deserialize)]
pub struct WordsRequest {
    pub theme: String,
    pub language: String,
    pub difficulty: String,
    pub word_count: u32,
    pub history: Vec<String>,
}

#[derive(Serialize)]
pub struct WordsResponse {
    pub words: Vec<String>,
}

// Difficulty descriptions per language, mirroring the TRANSLATIONS constant in App.tsx.
fn difficulty_prompt(language: &str, difficulty: &str) -> &'static str {
    let prompts: HashMap<&str, HashMap<&str, &str>> = HashMap::from([
        ("en", HashMap::from([
            ("EASY",   "very common, everyday objects or simple concepts everyone knows instantly"),
            ("MEDIUM", "moderately specific or slightly abstract concepts, still well-known but requiring more creative hints"),
            ("HARD",   "specialized but still recognizable terms, or abstract concepts that are challenging to describe but known to the general public"),
        ])),
        ("pt", HashMap::from([
            ("EASY",   "objetos cotidianos muito comuns ou conceitos simples que todos conhecem instantaneamente"),
            ("MEDIUM", "conceitos moderadamente específicos ou levemente abstratos, ainda bem conhecidos mas que exigem dicas mais criativas"),
            ("HARD",   "termos especializados mas ainda reconhecíveis, ou conceitos abstratos que são desafiadores de descrever, mas conhecidos pelo público em geral"),
        ])),
        ("es", HashMap::from([
            ("EASY",   "objetos cotidianos muy comunes o conceptos simples que todos conocen al instante"),
            ("MEDIUM", "conceptos moderadamente específicos o ligeramente abstractos, todavía conocidos pero que requieren pistas más creativas"),
            ("HARD",   "términos especializados pero aún reconocibles, o conceptos abstractos que son difíciles de describir pero conocidos por el público en general"),
        ])),
        ("fr", HashMap::from([
            ("EASY",   "objets quotidiens très courants ou concepts simples que tout le monde connaît instantanément"),
            ("MEDIUM", "concepts modérément spécifiques ou légèrement abstraits, encore bien connus mais nécessitant des indices plus créatifs"),
            ("HARD",   "termes spécialisés mais encore reconnaissables, ou concepts abstraits difficiles à décrire mais connus du grand public"),
        ])),
        ("de", HashMap::from([
            ("EASY",   "sehr häufige Alltagsgegenstände oder einfache Konzepte, die jeder sofort kennt"),
            ("MEDIUM", "mäßig spezifische oder leicht abstrakte Konzepte, die immer noch bekannt sind, aber kreativere Hinweise erfordern"),
            ("HARD",   "Fachbegriffe, die aber noch erkennbar sind, oder abstrakte Konzepte, die schwer zu beschreiben, aber der Allgemeinheit bekannt sind"),
        ])),
        ("ja", HashMap::from([
            ("EASY",   "非常に一般的で日常的な物や、誰もがすぐにわかる簡単な概念"),
            ("MEDIUM", "ある程度具体的、あるいは少し抽象的な概念で、よく知られているがより独創的なヒントが必要なもの"),
            ("HARD",   "専門的だが認識可能な用語、あるいは説明するのは難しいが一般に知られている抽象的な概念"),
        ])),
        ("zh", HashMap::from([
            ("EASY",   "非常常见的日常物品或每个人都能立即理解的简单概念"),
            ("MEDIUM", "中等程度的具体或略微抽象的概念，仍然广为人知，但需要更有创意的提示"),
            ("HARD",   "专业但仍可识别的术语，或描述起来具有挑战性但公众已知晓的抽象概念"),
        ])),
    ]);

    prompts
        .get(language)
        .and_then(|d| d.get(difficulty))
        .copied()
        .unwrap_or("moderately specific concepts, well-known but requiring creative hints")
}

pub async fn generate_words(
    State(state): State<Arc<AppState>>,
    Json(req): Json<WordsRequest>,
) -> Result<Json<WordsResponse>, (StatusCode, String)> {
    let diff_prompt = difficulty_prompt(&req.language, &req.difficulty);
    let history_str = req.history.join(", ");

    let system_prompt = "You are a word game assistant. \
        You generate themed vocabulary lists for a guessing game similar to Taboo. \
        Always respond with valid JSON containing a 'words' array of single words, with no extra text.";

    let user_prompt = format!(
        "Generate a list of exactly {count} diverse, single words that perfectly fit the theme: \"{theme}\". \
        Language: {lang} (all words must be in this language). \
        Difficulty: {diff} ({diff_prompt}). \
        \nCRITICAL RULES:\
        \n- Each must be a SINGLE word (no spaces).\
        \n- Must be different from these already-used words: {history}.\
        \n- Words MUST be recognizable to an average person — no obscure or archaic terms even on HARD mode.\
        \n- The word must be guessable when someone gives hints without saying it directly.\
        \nRespond only with JSON in this format: {{\"words\": [\"word1\", \"word2\", ...]}}",
        count = req.word_count,
        theme = req.theme,
        lang = req.language,
        diff = req.difficulty,
        diff_prompt = diff_prompt,
        history = history_str,
    );

    let body = serde_json::json!({
        "model": "llama-3.3-70b-versatile",
        "messages": [
            { "role": "system", "content": system_prompt },
            { "role": "user",   "content": user_prompt }
        ],
        "response_format": { "type": "json_object" },
        "temperature": 1.0
    });

    let resp = state
        .http_client
        .post("https://api.groq.com/openai/v1/chat/completions")
        .bearer_auth(&state.groq_api_key)
        .json(&body)
        .send()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, e.to_string()))?;

    if !resp.status().is_success() {
        let http_status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        tracing::error!("Groq API error {http_status}: {text}");

        if http_status == reqwest::StatusCode::TOO_MANY_REQUESTS {
            // Groq returns retry-after as a header or in the error body.
            let retry_msg = serde_json::from_str::<serde_json::Value>(&text)
                .ok()
                .and_then(|v| v["error"]["message"].as_str().map(String::from))
                .unwrap_or_else(|| "Rate limit exceeded. Please wait a moment and try again.".to_string());
            return Err((StatusCode::TOO_MANY_REQUESTS, retry_msg));
        }

        return Err((StatusCode::BAD_GATEWAY, format!("AI API error: {http_status}")));
    }

    let groq_resp: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| (StatusCode::BAD_GATEWAY, e.to_string()))?;

    let content = groq_resp["choices"][0]["message"]["content"]
        .as_str()
        .ok_or_else(|| (StatusCode::BAD_GATEWAY, "Unexpected Groq response shape".to_string()))?;

    let data: serde_json::Value = serde_json::from_str(content)
        .map_err(|e| (StatusCode::BAD_GATEWAY, format!("JSON parse error: {e}")))?;

    let words: Vec<String> = data["words"]
        .as_array()
        .ok_or_else(|| (StatusCode::BAD_GATEWAY, "Missing 'words' field".to_string()))?
        .iter()
        .filter_map(|v| v.as_str().map(String::from))
        .collect();

    Ok(Json(WordsResponse { words }))
}
