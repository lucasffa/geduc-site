# Componente Anchor

O componente `Anchor` é um átomo que representa links/âncoras seguindo o padrão de atomic design.

## Uso Básico

```svelte
<script>
  import Anchor from '$lib/components/atoms/Anchor.svelte';
</script>

<!-- Link básico -->
<Anchor href="/sobre">Sobre nós</Anchor>

<!-- Link externo -->
<Anchor href="https://exemplo.com" external showExternalIcon>
  Visite nosso site
</Anchor>

<!-- Link de email -->
<Anchor href="mailto:contato@exemplo.com" variant="underline">
  Envie um email
</Anchor>

<!-- Link de telefone -->
<Anchor href="tel:+5511999999999" variant="minimal">
  Ligue para nós
</Anchor>
```

## Props

### Props de Link
- `href`: URL de destino
- `target`: Como abrir o link (`_blank`, `_self`, `_parent`, `_top`)
- `rel`: Relação do link (para segurança)
- `external`: Se é um link externo
- `download`: Se deve fazer download do recurso

### Props de Estilo
- `size`: Tamanho do texto (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`)
- `weight`: Peso da fonte (`light`, `normal`, `medium`, `semibold`, `bold`)
- `color`: Cor do texto (variantes ou hex)
- `align`: Alinhamento (`left`, `center`, `right`, `justify`)
- `leading`: Altura da linha (`tight`, `normal`, `relaxed`, `loose`)
- `truncate`: Se deve truncar o texto
- `maxLines`: Número máximo de linhas

### Props de Variante
- `variant`: Variante visual (`default`, `underline`, `button`, `minimal`)
- `showExternalIcon`: Se deve mostrar ícone para links externos

## Variantes

### Default
```svelte
<Anchor href="/link" variant="default">
  Link com sublinhado
</Anchor>
```

### Underline
```svelte
<Anchor href="/link" variant="underline">
  Link sempre sublinhado
</Anchor>
```

### Button
```svelte
<Anchor href="/link" variant="button">
  Link como botão
</Anchor>
```

### Minimal
```svelte
<Anchor href="/link" variant="minimal">
  Link minimalista
</Anchor>
```

## Exemplos de Uso no Footer

```svelte
<!-- Email de contato -->
<Anchor size="sm" href={`mailto:${contact.email}`} class="footer-contact-link">
  {contact.email}
</Anchor>

<!-- Telefone de contato -->
<Anchor size="sm" href={`tel:${contact.phone}`} class="footer-contact-link">
  {contact.phone}
</Anchor>

<!-- Links de navegação -->
<Anchor 
  size="sm" 
  href={linkItem.href} 
  target={linkItem.external ? '_blank' : undefined}
  external={linkItem.external}
  class="footer-link-item"
>
  {linkItem.label}
</Anchor>
```

## Características

- ✅ Segue atomic design
- ✅ Suporte a links externos com ícone
- ✅ Múltiplas variantes visuais
- ✅ Acessibilidade integrada
- ✅ Segurança para links externos
- ✅ Estilos responsivos
- ✅ Estados de hover e focus
- ✅ Suporte a cores customizadas 