import http.server
import socketserver
import os
import webbrowser

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and disable aggressive caching for local dev
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

print("=" * 60)
print(f"🚀 Auth0 Modern Log-in Flow Server running at:")
print(f"👉 http://localhost:{PORT}")
print("=" * 60)
print("⚠️ Note: Make sure 'http://localhost:3000' is added to:")
print("  - Allowed Callback URLs")
print("  - Allowed Logout URLs")
print("  - Allowed Web Origins")
print("in your Auth0 Application Dashboard.")
print("=" * 60)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()
