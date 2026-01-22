.PHONY: build run server web clean test ssh-keys setup

# Run the CLI locally
run:
	go run .

# Run the SSH server
server:
	go run ./cmd/server

# Run the web server
web: build
	./cybertantra-web

# Build all binaries
build:
	go build -o cybertantra .
	go build -o cybertantra-server ./cmd/server
	go build -o cybertantra-web ./cmd/web

# Clean build artifacts
clean:
	rm -f cybertantra cybertantra-server cybertantra-web

# Run tests
test:
	go test ./...

# Generate SSH keys if they don't exist
ssh-keys:
	@mkdir -p .ssh
	@test -f .ssh/id_ed25519 || ssh-keygen -t ed25519 -f .ssh/id_ed25519 -N "" -q
	@echo "SSH keys ready"

# Full setup
setup: ssh-keys build
	@echo "Setup complete."
	@echo "  make run    - CLI mode"
	@echo "  make server - SSH server (port 2222)"
	@echo "  make web    - Web server (port 8080)"
