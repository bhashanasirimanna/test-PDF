export const ANNOTATION_COLORS = [
  { label: 'Yellow', value: '#FFD700' },
  { label: 'Green', value: '#4CAF50' },
  { label: 'Blue', value: '#2196F3' },
  { label: 'Pink', value: '#E91E8C' },
  { label: 'Red', value: '#F44336' },
  { label: 'Purple', value: '#9C27B0' },
];

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
