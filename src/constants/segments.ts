export interface BusinessSegment {
  label: string;
  code: string;
}

export const businessSegments: BusinessSegment[] = [
  { label: 'Assistência de Celular', code: 'CEL' },
  { label: 'Assistência de Ar Condicionado', code: 'AR' },
  { label: 'Assistência de Computadores', code: 'PC' },
  { label: 'Assistência de Eletrodomésticos', code: 'ELECTRO' },
  { label: 'Assistência de Automóveis', code: 'AUTO' },
  { label: 'Manutenção de Máquinas Industriais', code: 'INDUSTRIAL' },
  { label: 'Consultoria de TI', code: 'TI' },
  { label: 'Outros', code: 'OTHER' },
];