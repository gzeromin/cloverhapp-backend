import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { onlineMap } from './onlineMap';

@WebSocketGateway(3005, {
  cors: {
    origin: true,
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() public server: Server;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): { id: string } {
    console.log('message');
    return { id: ' 1234' };
  }

  @SubscribeMessage('test')
  handleTest(@MessageBody() data: string): string {
    console.log('test', data);
    return 'Hello world!';
  }

  @SubscribeMessage('login')
  handleLogin(
    @MessageBody() data: { id: number },
    @ConnectedSocket() socket: Socket,
  ): string {
    return 'Hello world!';
  }

  afterInit(server: any): any {
    console.log('websocketserver init');
  }

  handleConnection(@ConnectedSocket() socket: Socket): any {
    console.log('connected', socket.nsp.name);
    if (!onlineMap[socket.nsp.name]) {
      onlineMap[socket.nsp.name] = {};
    }
    socket.emit('hello', socket.nsp.name);
  }

  handleDisconnect(@ConnectedSocket() socket: Socket): any {
    console.log('disconnected', socket.nsp.name);
    const newNamespace = socket.nsp;

    delete onlineMap[socket.nsp.name][socket.id];
    newNamespace.emit('onlineList', Object.values(onlineMap[socket.nsp.name]));
  }
}
