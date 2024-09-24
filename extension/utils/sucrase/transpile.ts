import { transform } from 'sucrase';

export function transpile(code: string) {
  return transform(code, {
    transforms: ['typescript'],
    disableESTransforms: true,
  }).code;
}
