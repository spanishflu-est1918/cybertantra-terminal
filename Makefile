.PHONY: build run server clean

build:
	go build -o cybertantra .
	go build -o cybertantra-server ./cmd/server

run:
	go run .

server:
	go run ./cmd/server

clean:
	rm -f cybertantra cybertantra-server
