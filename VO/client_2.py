import socket
import interface
import time
from datetime import datetime

#Création de l'interface
user2 = interface.Interface("Charly")

# méthode try et except pour les éventuelles erreurs
try:
    my_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
except socket.error:
    pass

#Le port et l'ip par lesquels nous allons communiquer
host = "localhost"
portno = 1234

#Il faut que se client se connecte à ces deux adresses
my_socket.connect((host, portno))
#j'affiche un petit message de connexion
print("je suis en discussion avec le serveur")

# j'entamme ma boucle tant que nous seron,c en discussions ou connectés
while True:
    #Je prends le message à envoyer à l'autre user
    a = input("Entrer un nouveau message: "  )
    a = a.encode() #et bien évidemment il doit être encodé

    #J'ajoute ce message dans mon interface
    msg = user2.add_message("Charly", a)
    time.sleep(1) #1sec pour passer à l'autre état du message
    user2.update_message(msg, "received") #Changement de statut
    time.sleep(1)
    user2.update_message(msg, "read") #statut du message lu.
    print("Message envoyé: ", a) #Affichage du message envoyé

    my_socket.send(a) #là je dois envoyer mon message

    msg_in = my_socket.recv(1024).decode() #Réception du message de l'autre user tout en le décodant.

    #Affichage du message reçu avec lheure et la date de réception:
    print("Message recu: " , msg_in)
    print("Date et Heure: ", datetime.today())


my_socket.close()
