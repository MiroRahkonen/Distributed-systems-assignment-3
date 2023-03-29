#Help with setting up a server from this tutorial: https://www.geeksforgeeks.org/simple-chat-room-using-python/
#https://stackoverflow.com/questions/55496858/how-to-send-and-receive-message-from-client-to-client-with-python-socket

import sys, socket

clients = []


def clientThread(connection,address):
    print(f'Connected to server at: {address}')
    response = 'You have connected to the server'.encode('ascii')
    connection.send(response)
    
    while True:
        try:
            message = connection.recv(2048)
            if message:
                print(message.decode('ascii'))
                clients[0].send(message.encode('ascii'))
            else:
                break
        except:
            continue
    return


def main():
    loop = True
    #if len(sys.argv) != 2:
    #    print('Correct usage: python server.py [server IP-address]')
    #    return
    
    IPaddress = '127.0.0.1'    #sys.argv[1]
    PORT = 3000
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((IPaddress,PORT))
    server.listen()
    while loop:
        try:
            connection, address = server.accept()
            with connection:
                clients.append(connection)
                clientThread(connection,address)
        except KeyboardInterrupt:
            server.close()
            loop = False

    return 0

main()
