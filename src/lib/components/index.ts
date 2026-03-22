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
import Input from './atoms/Input.svelte';
import Select from './atoms/Select.svelte';
import Checkbox from './atoms/Checkbox.svelte';
import Badge from './atoms/Badge.svelte';
import Spinner from './atoms/Spinner.svelte';
import Toast from './atoms/Toast.svelte';
import Textarea from './atoms/Textarea.svelte';

// ================================
// MOLÉCULAS (MOLECULES)
// ================================
import NavItem from './molecules/NavItem.svelte';
import StatCard from './molecules/StatCard.svelte';
import FeatureCard from './molecules/FeatureCard.svelte';
import TestimonialCard from './molecules/TestimonialCard.svelte';
import SectionHeader from './molecules/SectionHeader.svelte';
import SocialLinks from './molecules/SocialLinks.svelte';
import TextBlock from './molecules/TextBlock.svelte';
import TeamMemberCard from './molecules/TeamMemberCard.svelte';
import FormField from './molecules/FormField.svelte';
import SearchBar from './molecules/SearchBar.svelte';
import Pagination from './molecules/Pagination.svelte';
import UserAvatar from './molecules/UserAvatar.svelte';
import BrandHeader from './molecules/BrandHeader.svelte';
import PermissionGate from './molecules/PermissionGate.svelte';
import ToastContainer from './molecules/ToastContainer.svelte';
import FilterBar from './molecules/FilterBar.svelte';

// ================================
// ORGANISMOS (ORGANISMS)
// ================================
import Navigation from './organisms/Navigation.svelte';
import HeroSection from './organisms/HeroSection.svelte';
import StatsSection from './organisms/StatsSection.svelte';
import OurImpact from './organisms/OurImpact.svelte';
import InitiativesSection from './organisms/InitiativesSection.svelte';
import TestimonialsSection from './organisms/TestimonialsSection.svelte';
import Footer from './organisms/Footer.svelte';
import OurTeam from './organisms/OurTeam.svelte';
import OurHistory from './organisms/OurHistory.svelte';
import DashboardSidebar from './organisms/DashboardSidebar.svelte';
import DashboardTopBar from './organisms/DashboardTopBar.svelte';
import DataTable from './organisms/DataTable.svelte';
import LoginForm from './organisms/LoginForm.svelte';
import TimelineView from './organisms/TimelineView.svelte';

// ================================
// TEMPLATES
// ================================
import HomePage from './templates/HomePage.svelte';
import DashboardTemplate from './templates/DashboardTemplate.svelte';
import AuthTemplate from './templates/AuthTemplate.svelte';

// ================================
// EXPORTAÇÕES INDIVIDUAIS
// ================================
// Atoms
export { default as Icon } from './atoms/Icon.svelte';
export { default as Button } from './atoms/Button.svelte';
export { default as Logo } from './atoms/Logo.svelte';
export { default as Heading } from './atoms/Heading.svelte';
export { default as Text } from './atoms/Text.svelte';
export { default as Image } from './atoms/Image.svelte';
export { default as Avatar } from './atoms/Avatar.svelte';
export { default as Anchor } from './atoms/Anchor.svelte';
export { default as Input } from './atoms/Input.svelte';
export { default as Select } from './atoms/Select.svelte';
export { default as Checkbox } from './atoms/Checkbox.svelte';
export { default as Badge } from './atoms/Badge.svelte';
export { default as Spinner } from './atoms/Spinner.svelte';
export { default as Toast } from './atoms/Toast.svelte';
export { default as Textarea } from './atoms/Textarea.svelte';

// Molecules
export { default as NavItem } from './molecules/NavItem.svelte';
export { default as StatCard } from './molecules/StatCard.svelte';
export { default as FeatureCard } from './molecules/FeatureCard.svelte';
export { default as TestimonialCard } from './molecules/TestimonialCard.svelte';
export { default as SectionHeader } from './molecules/SectionHeader.svelte';
export { default as SocialLinks } from './molecules/SocialLinks.svelte';
export { default as TextBlock } from './molecules/TextBlock.svelte';
export { default as TeamMemberCard } from './molecules/TeamMemberCard.svelte';
export { default as FormField } from './molecules/FormField.svelte';
export { default as SearchBar } from './molecules/SearchBar.svelte';
export { default as Pagination } from './molecules/Pagination.svelte';
export { default as UserAvatar } from './molecules/UserAvatar.svelte';
export { default as BrandHeader } from './molecules/BrandHeader.svelte';
export { default as PermissionGate } from './molecules/PermissionGate.svelte';
export { default as ToastContainer } from './molecules/ToastContainer.svelte';
export { default as FilterBar } from './molecules/FilterBar.svelte';

// Organisms
export { default as Navigation } from './organisms/Navigation.svelte';
export { default as HeroSection } from './organisms/HeroSection.svelte';
export { default as StatsSection } from './organisms/StatsSection.svelte';
export { default as OurImpact } from './organisms/OurImpact.svelte';
export { default as InitiativesSection } from './organisms/InitiativesSection.svelte';
export { default as TestimonialsSection } from './organisms/TestimonialsSection.svelte';
export { default as Footer } from './organisms/Footer.svelte';
export { default as OurTeam } from './organisms/OurTeam.svelte';
export { default as OurHistory } from './organisms/OurHistory.svelte';
export { default as DashboardSidebar } from './organisms/DashboardSidebar.svelte';
export { default as DashboardTopBar } from './organisms/DashboardTopBar.svelte';
export { default as DataTable } from './organisms/DataTable.svelte';
export { default as LoginForm } from './organisms/LoginForm.svelte';
export { default as TimelineView } from './organisms/TimelineView.svelte';

// Templates
export { default as HomePage } from './templates/HomePage.svelte';
export { default as DashboardTemplate } from './templates/DashboardTemplate.svelte';
export { default as AuthTemplate } from './templates/AuthTemplate.svelte';

// ================================
// TIPOS DE DADOS
// ================================
export type * from '../types/components';

// ================================
// EXPORTAÇÕES AGRUPADAS COM NAMESPACES
// ================================

export const Atoms = {
	Icon, Button, Logo, Heading, Text, Image, Avatar, Anchor,
	Input, Select, Checkbox, Badge, Spinner, Toast, Textarea
} as const;

export const Molecules = {
	NavItem, StatCard, FeatureCard, TestimonialCard, SectionHeader, SocialLinks, TextBlock, TeamMemberCard,
	FormField, SearchBar, Pagination, UserAvatar, BrandHeader, PermissionGate, ToastContainer, FilterBar
} as const;

export const Organisms = {
	Navigation, HeroSection, StatsSection, OurImpact, OurTeam, OurHistory,
	InitiativesSection, TestimonialsSection, Footer,
	DashboardSidebar, DashboardTopBar, DataTable, LoginForm, TimelineView
} as const;

export const Templates = {
	HomePage, DashboardTemplate, AuthTemplate
} as const;

export const Components = {
	Atoms, Molecules, Organisms, Templates,
	...Atoms, ...Molecules, ...Organisms, ...Templates
} as const;
