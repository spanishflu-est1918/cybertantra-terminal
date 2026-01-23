# Cybertantra Web Terminal

Two ways to serve Cybertantra in a browser:

## Option 1: ttyd (Quick)

Serves the Ink terminal app via WebSocket.

```bash
# Start ttyd server
cd ../ink
./serve-ttyd.sh 7681

# Or manually:
ttyd --port 7681 --writable npm start
```

Then open `http://localhost:7681` or embed the included `index.html`.

### Expose via Tailscale Funnel

```bash
tailscale funnel --bg 7681
```

This makes it available at `https://raspgorkpi.drake-halosaur.ts.net:7681`

## Option 2: xterm.js (Embedded)

The `index.html` file provides a styled xterm.js terminal that connects to ttyd.

1. Start ttyd as above
2. Open `index.html` in a browser
3. Or embed in another site:

```html
<iframe
  src="https://cybertantra.xyz/terminal"
  width="100%"
  height="600"
  style="border: none;"
></iframe>
```

## Configuration

Edit `index.html` and change `TTYD_URL` to your server:

```javascript
const TTYD_URL = 'wss://your-server.com/ws';
```

## Production

For production, run ttyd behind nginx with SSL:

```nginx
location /terminal {
    proxy_pass http://localhost:7681;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
}
```
