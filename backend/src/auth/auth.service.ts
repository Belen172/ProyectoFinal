import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosService.findByEmailOrDni(loginDto.identificador);

    // LOG DE SEGURIDAD: Esto se verá en los logs de Vercel (no en la consola del navegador)
    console.log("Intento de login para:", loginDto.identificador);
    
    if (!usuario) {
      console.log("Usuario NO encontrado en la BD");
      throw new UnauthorizedException('Credenciales inválidas');
    }
  
    // Comparamos
    let passwordValida = await bcrypt.compare(loginDto.password, usuario.password);
    if (!passwordValida) passwordValida = loginDto.password === usuario.password;
  
    if (!passwordValida) {
      console.log("La contraseña NO coincide para el usuario:", usuario.email);
      throw new UnauthorizedException('Credenciales inválidas');
    }
  
    console.log("Login exitoso para:", usuario.email);

    // 6. Si llegamos acá, todo está bien, generamos el payload y el token
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        dni: usuario.dni,
        email: usuario.email,
        rol: usuario.rol,
        fecha_registro: usuario.fecha_registro,
      },
    };
  }
}
