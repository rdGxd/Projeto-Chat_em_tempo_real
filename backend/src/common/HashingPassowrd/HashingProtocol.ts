export abstract class HashingProtocol {
  abstract hash(password: string): Promise<string>;
  abstract compare(password: string, hashed: string): Promise<boolean>;
}
