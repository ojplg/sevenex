from http.server import BaseHTTPRequestHandler, HTTPServer
import time
import json

hostName = "localhost"
serverPort = 8088

workoutsFilename = './workouts.json'

class MyServer(BaseHTTPRequestHandler):

    def readWorkoutsFileBytes(self):
        workouts_file = open(workoutsFilename, 'rb') 
        return workouts_file.read()
        
    def readWorkoutsFileJson(self):
        return json.loads(self.readWorkoutsFileBytes())        
    
    def saveWorkoutsFile(self, workouts):
        workouts_file = open(workoutsFilename, 'w')
        json.dump( workouts, workouts_file )

    def do_GET(self):
        print("GET REQUESTED: " + self.path)        
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        workouts_bytes = self.readWorkoutsFileBytes()
        self.wfile.write(workouts_bytes)

    def do_POST(self):
        print("POST REQUESTED " + self.path)
        if self.path == '/save':
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            print("POST BODY " + str(body))
            existingWorkouts = self.readWorkoutsFileJson()
            newWorkout = json.loads(body)
            existingWorkouts.append(newWorkout)
            self.saveWorkoutsFile(existingWorkouts)
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(b'')
        else: 
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not found')

if __name__ == "__main__":        
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
