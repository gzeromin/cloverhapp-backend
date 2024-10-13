import * as fs from 'fs';
import * as path from 'path';
import { plainToInstance, ClassConstructor } from 'class-transformer';

/**
 * Reads a JSON file and converts it to an instance of a provided DTO class using generics.
 * @param dtoClass - The DTO class constructor to convert JSON into.
 * @param filePath - Path to the JSON file (relative to the project root or absolute).
 * @returns Instance of the DTO class.
 */
export function readJson<T>(
  dtoClass: ClassConstructor<T>,
  filePath: string,
): T {
  const absolutePath = path.resolve(filePath);
  const data = fs.readFileSync(absolutePath, 'utf8');
  const jsonData = JSON.parse(data);

  // Convert the parsed JSON into an instance of the provided DTO class
  return plainToInstance(dtoClass, jsonData);
}
