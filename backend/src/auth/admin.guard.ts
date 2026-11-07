import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import type { Request } from 'express';
  
  interface TokenPayload {
    sub: number;
    email: string;
    rol: string;
  }
  
  @Injectable()
  export class AdminGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
  
      const [tipo, token] =
        request.headers.authorization?.split(' ') ?? [];
  
      if (tipo !== 'Bearer' || !token) {
        throw new UnauthorizedException(
          'Debés iniciar sesión para realizar esta acción.',
        );
      }
  
      let payload: TokenPayload;
  
      try {
        // Verifica la firma y el vencimiento usando la
        // configuración de JwtModule en AuthModule.
        payload = await this.jwtService.verifyAsync<TokenPayload>(token);
      } catch {
        throw new UnauthorizedException(
          'La sesión no es válida o venció. Volvé a iniciar sesión.',
        );
      }
  
      if (payload.rol !== 'ADMIN') {
        throw new ForbiddenException(
          'Solo el administrador puede realizar esta acción.',
        );
      }
  
      return true;
    }
  }