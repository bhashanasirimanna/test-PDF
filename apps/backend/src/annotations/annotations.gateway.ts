import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
  namespace: '/',
})
export class AnnotationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    // Accept token from: explicit auth object, Authorization header, or access_token cookie
    const cookieHeader: string = (client.handshake.headers?.cookie as string) || '';
    const cookieToken = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('access_token='))
      ?.slice('access_token='.length);

    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.split(' ')[1] ||
      cookieToken;

    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwt.verify(token, { secret: this.config.get('JWT_SECRET') });
      (client as any).userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('join-document')
  handleJoin(@MessageBody() { documentId }: { documentId: string }, @ConnectedSocket() client: Socket) {
    client.join(`doc:${documentId}`);
    return { joined: documentId };
  }

  @SubscribeMessage('leave-document')
  handleLeave(@MessageBody() { documentId }: { documentId: string }, @ConnectedSocket() client: Socket) {
    client.leave(`doc:${documentId}`);
  }

  broadcastToDocument(documentId: string, event: string, payload: any) {
    this.server.to(`doc:${documentId}`).emit(event, payload);
  }

  broadcastReply(annotationId: string, reply: any) {
    this.server.emit('reply:created', { reply, annotationId });
  }
}
