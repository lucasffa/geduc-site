// src/lib/components/index.ts

// ================================
// ÁTOMOS (ATOMS)
// ================================
import Icon from './atoms/Icon.svelte';
import Button from './atoms/Button.svelte';
import Logo from './atoms/Logo.svelte';
import Heading from './atoms/Heading.svelte';
import Text from './atoms/Text.svelte';
import Image from './atoms/Image.svelte';
import Avatar from './atoms/Avatar.svelte';
import Anchor from './atoms/Anchor.svelte';

// ================================
// MOLÉCULAS (MOLECULES)
// ================================
import NavItem from './molecules/NavItem.svelte';
import StatCard from './molecules/StatCard.svelte';
import FeatureCard from './molecules/FeatureCard.svelte';
import TestimonialCard from './molecules/TestimonialCard.svelte';
import SectionHeader from './molecules/SectionHeader.svelte';
import SocialLinks from './molecules/SocialLinks.svelte';

// ================================
// ORGANISMOS (ORGANISMS)
// ================================
import Navigation from './organisms/Navigation.svelte';
import HeroSection from './organisms/HeroSection.svelte';
import StatsSection from './organisms/StatsSection.svelte';
import InitiativesSection from './organisms/InitiativesSection.svelte';
import TestimonialsSection from './organisms/TestimonialsSection.svelte';
import Footer from './organisms/Footer.svelte';

// ================================
// EXPORTAÇÕES INDIVIDUAIS
// ================================
export { default as Icon } from './atoms/Icon.svelte';
export { default as Button } from './atoms/Button.svelte';
export { default as Logo } from './atoms/Logo.svelte';
export { default as Heading } from './atoms/Heading.svelte';
export { default as Text } from './atoms/Text.svelte';
export { default as Image } from './atoms/Image.svelte';
export { default as Avatar } from './atoms/Avatar.svelte';
export { default as Anchor } from './atoms/Anchor.svelte';

export { default as NavItem } from './molecules/NavItem.svelte';
export { default as StatCard } from './molecules/StatCard.svelte';
export { default as FeatureCard } from './molecules/FeatureCard.svelte';
export { default as TestimonialCard } from './molecules/TestimonialCard.svelte';
export { default as SectionHeader } from './molecules/SectionHeader.svelte';
export { default as SocialLinks } from './molecules/SocialLinks.svelte';

export { default as Navigation } from './organisms/Navigation.svelte';
export { default as HeroSection } from './organisms/HeroSection.svelte';
export { default as StatsSection } from './organisms/StatsSection.svelte';
export { default as InitiativesSection } from './organisms/InitiativesSection.svelte';
export { default as TestimonialsSection } from './organisms/TestimonialsSection.svelte';
export { default as Footer } from './organisms/Footer.svelte';

// ================================
// TIPOS DE DADOS
// ================================
export type * from '../types/components';

// ================================
// EXPORTAÇÕES AGRUPADAS COM NAMESPACES
// ================================

// Átomos
export const Atoms = {
  Icon,
  Button,
  Logo,
  Heading,
  Text,
  Image,
  Avatar,
  Anchor
} as const;

// Moléculas
export const Molecules = {
  NavItem,
  StatCard,
  FeatureCard,
  TestimonialCard,
  SectionHeader,
  SocialLinks
} as const;

// Organismos
export const Organisms = {
  Navigation,
  HeroSection,
  StatsSection,
  InitiativesSection,
  TestimonialsSection,
  Footer
} as const;

// Namespace principal Components
// 
// USO RECOMENDADO - Abordagem Namespaced (Clean Code):
// ```typescript
// import { Components } from '$lib/components';
// 
// // Usando namespaces organizados
// const { Text, Button, Icon } = Components.Atoms;
// const { NavItem, StatCard } = Components.Molecules;
// const { Navigation, Footer } = Components.Organisms;
// 
// // Ou usando destructuring direto
// const { Atoms, Molecules, Organisms } = Components;
// const { Text } = Atoms;
// const { NavItem } = Molecules;
// ```
//
// USO ALTERNATIVO - Importações individuais (Compatibilidade):
// ```typescript
// import { Text, Button, Icon } from '$lib/components';
// ```
export const Components = {
  Atoms,
  Molecules,
  Organisms,
  // Também disponível diretamente para compatibilidade
  ...Atoms,
  ...Molecules,
  ...Organisms
} as const;