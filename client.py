#Help with setting up a server from this tutorial: https://www.geeksforgeeks.org/simple-chat-room-using-python/
#https://stackoverflow.com/questions/55496858/how-to-send-and-receive-message-from-client-to-client-with-python-socket


import sys,socket,select



def main():
    loop = True
    #if len(sys.argv) != 2:
    #    print('Correct usage: python client.py [server IP-address]')
    #    return
    IPaddress = '127.0.0.1'    #sys.argv[1]
    port = 3000

    server = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
    server.connect((IPaddress,port))
    while loop == True:

        socketsList = [server]
        readSocket = select.select(socketsList,[],[])

        for sock in readSocket:
            if sock == server:
                print('AA')
                message = sock.recv(2048)
                print(message)
            else:
                message = input()
                if(message == '/disconnect'):
                    loop = False
                    break
                server.send(message.encode('ascii'))

    server.close()
    return 0

main()