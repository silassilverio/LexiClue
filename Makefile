.PHONY: dev build deploy clean

# Start backend (port 8080) and frontend (port 3000) in parallel.
dev:
	@trap 'kill 0' SIGINT; \
	  (cd backend && cargo run) & \
	  (cd frontend && npm run dev) & \
	  wait

# Build the Docker image locally to test before deploying.
build-docker:
	docker build -t lexiclue .

# Run the Docker image locally (set GROQ_API_KEY in your shell first).
run-docker:
	docker run -p 8080:8080 -e GROQ_API_KEY=$$GROQ_API_KEY lexiclue

clean:
	cd frontend && npm run clean
	cd backend && cargo clean
