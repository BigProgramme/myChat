import interface
import socket
import time
from datetime import datetime # jai importer cette bibliothèque pour des raisons d'améliorations de mon code

#Création de l'interface de l'utilisateur 1pour marquer les états des messages
user1 = interface.Interface("saint")


# Là je demande à l'user2 s'il veut voir la dernière historique
print("Répondre par oui ou non")
question = input("Vous désirez voir l\'historique de la dernière conversation? : ")
# Si c'est "Oui", bah je lui montre l'historique
#Pour cela, j'ai créé un fichier csv dans lequel j'ai stocké tous les messages de la dernière conversations.
if question == "oui":
  y = open("historique_serveur.csv", "r")
  print(y.read())
  y.close()
else:
    print("comme vous voulez")
#Création du socket
try:
  my_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
except socket.error:
  print("impossible de créer le sockt")

host = "localhost" #pour l'adresse locale #ou 127.0.0.1
portno = 1234 #le numéro du port au choix


#Liaison du socket avec l'adresse prédéfini mais dans un tuple
my_socket.bind((host, portno))

print("my socket bound to adress and port number: ", (host, portno))

#on écoute les connexions
my_socket.listen()

#print("listening for client")

#Acceptation de la requete du user2 il fois qu'il est connecté
#client_adrr est l'endroit où le socket est lié.

client, client_adrr = my_socket.accept()

#On affiche l'adresse de l'autre utilisateur
print("connection established with client at adresse", (host, portno))

#je créé une boucle infinie tanque l'un des deux sera connecté
# pour échanger les messages
#une liste pour stocker les échanges
stock_message = []
file = open("historique_serveur.csv", mode="a")
while True:
  #Ici on reçoit le message de l'autre utilisateur
  # qu'on doit décoder
  msg = client.recv(1024).decode()
  print("message received: ",  msg)
  print("Date et heure:", datetime.today())

#Une fois que l'on reçoit le message, on pense aussi à envoyer un
  # et pour ce faire, je créé une variable a qui va contenir notre message à envoyer
  a = input("Tapez le nouveau message:  " )
  #et bien évidement ce message doit être encodé
  a = a.encode()
  #ici j'utilise l'interface pour ajouter le message a et le nom de l'xpéditeur
  msg_out = user1.add_message("Saint", a)
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
  stock_message.append(msg)
  stock_message.append(a.decode())

  # Ici je parcours la liste de mes messages stockés
  for messages in stock_message:
    # je mets(ou écris) ces messages dans mon fichier
    file.write(str(messages)+'\n')

    #file.close()



  #client.close()


  #my_socket.close()


