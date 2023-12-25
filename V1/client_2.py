import socket
import interface
import time
from datetime import datetime
user2 = interface.Interface("Charly")



# Là je demande à l'user2 s'il veut voir la dernière historique
print("Répondre par oui ou non")
question = input("Vous désirez voir l\'historique de la dernière conversation? : ")

# Si c'est "Oui", bah je lui montre l'historique
#Pour cela, j'ai créé un fichier csv dans lequel j'ai stocké tous les messages de la dernière conversations.
if question == "oui":
    m = open("historique.csv", "r")
    k = m.read()
    print(k)
else:
    print("comme vous voulez")

try:
    my_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
except socket.error:
    pass

host = "localhost"
portno = 1234
my_socket.connect((host, portno))
print("je suis en discussion avec le serveur")
#une liste pour stocker les échanges
stock_message = []
#cei est le fichier qui va contenir tout l'historique
#il est en mode a = append pour ajouter les messages:
file = open("historique.csv", mode="a")
while True:
    a = input("Entrer un nouveau message: "  )
    a = a.encode()
    msg = user2.add_message("Charly", a)
    time.sleep(1)
    user2.update_message(msg, "received")
    time.sleep(1)
    user2.update_message(msg, "read")

    print("Message envoyé: ", a.decode())
    try:
        my_socket.send(msg.__str__())
    except TypeError:
        my_socket.send(a)
    msg_in = my_socket.recv(1024).decode()
    print("Message recu: ", msg_in)
    print("Date et Heure de réception: ", datetime.today())



    #Ajout des échanges dans la liste
    stock_message.append(a.decode())
    stock_message.append(msg_in)

    # Ici je parcours la liste de mes messages stockés
    for messages in stock_message:
        #je met(ou écris) ces messages dans mon fichier
        file.write(str(messages)+'\n')
        #file.close()

my_socket.close()

