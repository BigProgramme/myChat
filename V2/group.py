import socket
from datetime import datetime
from _thread import *

# import interface
# Noter que notre group n'envoie pas de message , il ne fera que recevoir des messaes
# c'est un groupe après tout
ServerSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
host = '127.0.0.1'
portno = 1234  # le numéro du port au choix
# conteur de client
nbeclient = 0
try:
    ServerSocket.bind((host, portno))
except socket.error as e:
    print(e)
print("my socket bound to adress and port number: ", (host, portno))

print('En attente de connexion...')
ServerSocket.listen(5)


# une fonction thread qui se connecte à client
# avec une adresse différente donnée par notre group
def threaded_client(connection):
    #Si on a une connection donc si un client rejoint le groupe
    if connection:
        connection.send(str.encode('Welcome to the Watsapp_group'))
    else:
        print("un client est parti")
    while True:
        # obtention des données ou messages des users

        data = connection.recv(1024)
        s = data.decode()
        print("message received: ", s)
        print("Date et heure:", datetime.now())
        if not data:
            break
    connection.close()


# pour ne pas que le serveur s'arrete, j'attaque avec une boucle infinie

while True:
    # acceptation
    Client, address = ServerSocket.accept()
    print('connecté à: ', address[0], ':', address[1])
    # si un se connecte, on commence un nouveau thread

    # là on utilise la fonction start_new_thread de la classe thread
    # cette fonction attribue un nouveau thread à chaque client
    # pour les gérer individuellement
    start_new_thread(threaded_client, (Client,))
    nbeclient += 1  # nombre de clients, comme le dit son nom, mdr
    print("nombre de clients en dans le groupe: ", nbeclient)

ServerSocket.close()
