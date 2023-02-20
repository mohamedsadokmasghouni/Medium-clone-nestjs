import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(config: ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get('secret'),
            
        });
    }

    async validate(payload: any) {
        return { id: payload.sub, username: payload.username };
      }
}