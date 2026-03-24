import { generateClientId } from '@sebrae/api-base';

const cpfComMascara = '123.456.789-09';
const cpfSemMascara = '12345678909';

const clientIdA = generateClientId(cpfComMascara);
const clientIdB = generateClientId(cpfSemMascara);

console.log(clientIdA);
console.log(clientIdA === clientIdB);
