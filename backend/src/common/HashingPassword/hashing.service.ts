import bcrypt from 'bcrypt';
import { HashingProtocol } from './HashingProtocol';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HashingService extends HashingProtocol {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  async compare(password: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(password, hashed);
  }
}
