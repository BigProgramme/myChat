import socket
import time
#Le client il fonctionne comme le client du V0
import interface

username = input("votre nom avant d'intégrer le groupe:  ")
user = interface.Interface(username)
ClientSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
host = '127.0.0.1'
port = 1234

try:
    ClientSocket.connect((host, port))
except socket.error as e:
    print(e)


while True:
    msg_in = ClientSocket.recv(1024)
    print(msg_in)
    b = input("votre message:  ")
    msg = user.add_message(username, b)
    time.sleep(1)
    ClientSocket.send(b.__str__().encode())
    user.update_message(msg,"read")


ClientSocket.close()