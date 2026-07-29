import http.server
import socketserver
import json
import time

PORT = 8080

class MockBackendHandler(http.server.BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        try:
            req_json = json.loads(post_data)
        except:
            req_json = {}

        print(f"\n[RECEIVE] POST to {self.path}")
        print(f"Payload: {req_json}")

        if self.path == '/api/v1/smartaccess/verify/pin':
            pin_code = req_json.get("pinCode", "")
            
            # Simulate 1s network delay
            time.sleep(1) 
            
            if pin_code == "123456":
                print("=> Status: GRANTED")
                response = {
                    "success": True,
                    "data": {"status": "GRANTED", "message": "Welcome Student"}
                }
            else:
                print("=> Status: DENIED")
                response = {
                    "success": True,
                    "data": {"status": "DENIED", "message": "Invalid PIN"}
                }
            
            self._set_headers(200)
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        elif self.path == '/api/v1/smartaccess/offline-log-batch':
            print("=> Offline Logs synced successfully!")
            response = {"success": True, "message": "Logs synced successfully"}
            self._set_headers(201)
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"success": False, "message": "Not Found"}).encode('utf-8'))

with socketserver.TCPServer(("", PORT), MockBackendHandler) as httpd:
    print(f"Mock Backend Server running at http://localhost:{PORT}")
    httpd.serve_forever()
