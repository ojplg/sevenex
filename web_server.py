from http.server import BaseHTTPRequestHandler, HTTPServer
import time

hostName = "localhost"
serverPort = 8088

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        print("REQUESTED: " +self.path)        
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        workouts_file = open('./workouts.json','rb')
        workout_bytes = workouts_file.read()
        self.wfile.write(workout_bytes)

if __name__ == "__main__":        
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
