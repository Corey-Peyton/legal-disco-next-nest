import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { CookieSerializer } from './cookie.serializer';

@Module({
    imports: [
        PassportModule.register({session: true}),
    ],
    providers: [AuthService, LocalStrategy, CookieSerializer],
    controllers: [AuthController],
    exports: [PassportModule],
})
export class AuthModule { }