L'objectif est d'implémenter un chat qui
permet également la synchronisation des états des messages entre ses utilisateurs. Pour
simplifier la progression de l'implémentation, différentes "versions (V0, V1 et V2)" de
l'application de complexité croissante sont implémentées.

V0: 
La première version de l'application est un simple chat en tête-à-tête. Deux clients se
connectent et échangent des messages. On aura qu'à savoir si ça été lu et/ou reçu

V1:
la V1 s'appuie sur V0 pour mettre en œuvre la coordination d'état entre les clients. Cette logique
permet de rétablir l'historique du chat si l'un des clients "ferme" son application.

V2:
V2 permet les échanges de messages entre plusieurs hôtes. Considérez
cela comme un "groupe" WhatsApp. Un serveur central est utilisé pour interconnecter
plusieurs clients entre eux. Pour implémenter V2, il faut utiliser des "threads" pour le serveur.

