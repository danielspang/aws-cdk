//import * as path from 'path';
import { TypeSystem } from 'jsii-reflect';
import { generateClassAssignment } from './generate';

export async function generateMissingExamples(assemblyLocations: string[]) {
  for (const assemblyLocation of assemblyLocations) {
    const typesystem = new TypeSystem();
    await typesystem.load(assemblyLocation);
    //await typesystem.load(path.join(assemblyLocation, '.jsii'));
    for (const classType of typesystem.classes) {
      const example = generateClassAssignment(classType);
      if (example) {
        // eslint-disable-next-line no-console
        console.log('// This example was autogenerated. You will have to change the values.');
        // eslint-disable-next-line no-console
        console.log(example);
      }
    }
  }
}