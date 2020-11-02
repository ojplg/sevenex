from http.server import BaseHTTPRequestHandler, HTTPServer
import time
import json

hostName = "localhost"
serverPort = 8088

workoutsFilename = './workouts.json'

class MyServer(BaseHTTPRequestHandler):

    def readWorkoutsFileString(self):
        workouts_file = open(workoutsFilename, 'r', encoding='utf-8') 
        return workouts_file.read()

    def readWorkoutsFileBytes(self):
        contents = self.readWorkoutsFileString()
        bts = bytearray(contents, encoding='utf-8')
        return bts
        
    def readWorkoutsFileJson(self):
        return json.loads(self.readWorkoutsFileString())        
    
    def saveWorkoutsFile(self, workouts):
        workouts_file = open(workoutsFilename, 'w')
        json.dump( workouts, workouts_file )

    def do_GET(self):
        print("GET : " + self.path)        
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        workouts_bytes = self.readWorkoutsFileBytes()
        self.wfile.write(workouts_bytes)

    def save(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        print("save content: " + str(body))
        existingWorkouts = self.readWorkoutsFileJson()
        newWorkout = json.loads(body.decode(encoding='utf-8'))
        if ('oldName' in newWorkout):
            print("Updating " + newWorkout['oldName'])
            oldName = newWorkout['oldName']
            del newWorkout['oldNameo']
            # FIXME this will not work, file is a list not a map
            del existingWorkouts[oldName]
            existingWorkouts.append 
        else:
            existingWorkouts.append(newWorkout)
        self.saveWorkoutsFile(existingWorkouts)
        print("SAVED WORKOUTS")
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(b'')

    def do_POST(self):
        print("POST " + self.path)
        if self.path == '/save':
            self.save()
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
