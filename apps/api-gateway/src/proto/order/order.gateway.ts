/* eslint-disable prettier/prettier */
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust this to your frontend origin
  },
})
export class OrderGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  notifyMerchant(order: any) {
    // Emit the order notification to the specific merchant
    this.server.to(order.merchantId).emit('orderNotification', order);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() data: { merchantId: string }, client: Socket) {
    client.join(data.merchantId);
  }
}
