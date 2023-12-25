import interface
import socket
import time
from datetime import datetime # jai importer cette bibliothèque pour des raisons d'améliorations de mon code

#Création de l'interface de l'utilisateur 1pour marquer les états des messages
user1 = interface.Interface("saint")

#Création du socket
try:
  my_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
except socket.error:
  print("impossible de créer le sockt")

host = "localhost" #pour l'adresse locale
portno = 1234 #le numéro du port au choix

#Liaison du socket avec l'adresse prédéfini mais dans un tuple
my_socket.bind((host, portno))

print("my socket bound to adress and port number: ", (host, portno))

#on écoute les connexions
my_socket.listen()

#print("listening for client")

#Acceptation de la requete du user2 une fois qu'il est connecté
#client_adrr est l'endroit où le socket est lié.

client, client_adrr = my_socket.accept()

#On affiche l'adresse de l'autre utilisateur
print("connection established with client at adresse", (host, portno))




#je créé une boucle infinie tanque l'un des deux sera connecté
# pour échanger les messages
while True:

  #Ici on reçoit le message de l'autre utilisateur
  # qu'on doit décoder
  msg = client.recv(1024).decode()
  print("message received: ",  msg)
  print("Date et heure:", datetime.today())
  if not msg:
    break

#Une fois que l'on reçoit le message, on pense aussi à envoyer un
  # et pour se faire, je créé une variable a qui va contenir notre message à envoyer
  a = input("Tapez le nouveau message:  " )
  #et bien évidement ce message doit être encodé
  a = a.encode()
  #ici j'utilise l'interface pour ajouter le message a et le nom de l'xpéditeur
  msg_out = user1.add_message("Saint".encode(), a)
  #Une fois que le message ajouté, je défini le temps d'envoie, ici temps = 1sec
  time.sleep(1)

  #Logiquement quand le message est envoyé, il doit être reçu
  #c'est pour cela sur la ligne suivante je créé un état de "reception
  # de notre message sortant ou envoyé
  user1.update_message(msg_out, "received")
  time.sleep(1)

  #Si le message est reçu, il doit être lu ou vu, donc l'état
  # de message sera mis à jour de "reçu" ---> "lu"
  user1.update_message(msg_out, "read")

  #et finalement il est envoyé
  client.send(a)
  #on affiche notre message pour être certain qu'il a été send.
  print("Message envoyé: ", a)



#client.close()

my_socket.close()


