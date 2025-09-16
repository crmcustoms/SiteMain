export * from './arrow-icons';
export * from './feature-icons';
export * from './hero-icons';
export * from './why-icons';
export * from './language-icons';
export * from './theme-icons';
export * from './ui-icons';
export * from './dialog-icons';
export * from './dropdown-icons';
export * from './footer-icons';

// Заглушки для других иконок, которые будут добавлены позже
// Эти типы необходимы для поддержания совместимости с кодом, который раньше импортировал из lucide-react
export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
}; 