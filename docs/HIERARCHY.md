

### **Hierarquia de Componentes**

A estrutura segue o fluxo: **Templates → Organismos → Moléculas → Átomos**.

Tipagens estão em /src/lib/types/components.ts.

---

### **1. Átomos (Atoms)**

Os blocos de construção fundamentais e indivisíveis da interface.

*   **`Icon.svelte`**
    *   **Descrição**: Componente para renderizar ícones vetoriais (SVG).
    *   **Uso**:
        *   Ícones de redes sociais no rodapé (Facebook, LinkedIn, Instagram).
        *   Ícone de seta para cima no botão "voltar ao topo" no rodapé.
    *   **Detalhes de Estilo e Props (`IconProps`)**:
        *   `name`: `'facebook'`, `'linkedin'`, `'instagram'`, `'arrow-up'`
        *   `size`: `'md'` (para redes sociais), `'sm'` (para seta)
        *   `color`: `ColorVariant | 'white'`

*   **`Button.svelte`**
    *   **Descrição**: Elemento interativo para ações primárias e secundárias. Pode ser renderizado como `<button>` ou `<a>`.
    *   **Uso**:
        *   Botão "Saiba Mais" (preenchido) na seção Hero.
        *   Botão "Assista o Vídeo" (contorno) na seção Hero.
        *   Botão "Saiba Mais" na seção "Sobre Nós".
    *   **Detalhes de Estilo e Props (`ButtonProps`)**:
        *   `children`: 'Saiba Mais', 'Assista o Vídeo'
        *   `href`: URL de destino
        *   `variant`: `'primary'` (para o botão amarelo), `'outline'` (para o botão com borda azul)
        *   `size`: `'lg'`

*   **`Logo.svelte`**
    *   **Descrição**: O logo da organização "Guardiões da Educação".
    *   **Uso**:
        *   No canto superior esquerdo do cabeçalho.
        *   Na seção esquerda do rodapé.
    *   **Detalhes de Estilo e Props (`LogoProps`)**:
        *   `variant`: `'full'`
        *   `href`: `'/'` (para levar à página inicial)
        *   `interactive`: `true`

*   **`Heading.svelte`**
    *   **Descrição**: Para todos os títulos e cabeçalhos textuais.
    *   **Uso**:
        *   `level: 1`: "Guardiões da Educação..." (título principal).
        *   `level: 2`: "Nosso Impacto", "Sobre Nós", "Nossas Iniciativas", "Depoimentos".
        *   `level: 3`: Títulos dos cards, como "Mentoria de Oportunidades".
        *   Valores das estatísticas: "100+", "30+", "750k+", "25k+".
    *   **Detalhes de Estilo e Props (`HeadingProps`)**:
        *   `level`: `1`, `2`, `3` conforme a hierarquia da informação.
        *   `weight`: `'bold'` ou `'extrabold'`.
        *   `color`: Varia entre `primary`, `secondary` e `neutral` (branco/preto).

*   **`Text.svelte`**
    *   **Descrição**: Para corpos de texto, parágrafos e descrições.
    *   **Uso**:
        *   Descrição na seção Hero ("Somos um projeto...").
        *   Descrição abaixo das métricas de impacto ("Cidades alcançadas...").
        *   Texto do depoimento de "Gabriela Saito Pereira".
        *   Nome e cargo do autor do depoimento.
        *   Descrição nos cards de iniciativa.
    *   **Detalhes de Estilo e Props (`TextProps`)**:
        *   `as`: `'p'` ou `'span'`.
        *   `size`: `'md'` para parágrafos, `'sm'` para descrições menores (como o cargo no depoimento).
        *   `weight`: `'normal'` ou `'light'`.

*   **`Image.svelte`**
    *   **Descrição**: Componente para renderizar as ilustrações com efeito *halftone*.
    *   **Uso**: Cérebro, lâmpada, pino, grupo de pessoas, celular, alvo, mapa do Brasil, globo, livros, monitor, engrenagens, casa.
    *   **Detalhes de Estilo e Props (`ImageProps`)**:
        *   `src`: Caminho para o arquivo da imagem.
        *   `alt`: Texto descritivo para acessibilidade.
        *   `loading`: `'lazy'`.

*   **`Avatar.svelte`**
    *   **Descrição**: Imagem de perfil para representar um usuário.
    *   **Uso**: Foto da "Gabriela Saito Pereira" nos cards de depoimento.
    *   **Detalhes de Estilo e Props (`AvatarProps`)**:
        *   `src`: URL da imagem da pessoa.
        *   `alt`: "Foto de Gabriela Saito Pereira".
        *   `shape`: `'circle'`.
        *   `size`: `'md'`.

---

### **2. Moléculas (Molecules)**

Combinações de átomos que formam componentes funcionais simples.

*   **`NavItem.svelte`**
    *   **Descrição**: Um único item clicável na barra de navegação.
    *   **Uso**: "Home", "Sobre nós", "Iniciativas", "Summer Camp", "Contato".
    *   **Hierarquia**: Contém um átomo `Text` ou é um link estilizado.
    *   **Detalhes de Estilo e Props (`NavItemProps`)**:
        *   `children`: O texto do link.
        *   `href`: O caminho da página.
        *   `active`: `true` para a página atual ("Home").

*   **`StatCard.svelte`**
    *   **Descrição**: Exibe uma métrica de impacto com um ícone, valor e rótulo.
    *   **Uso**: Os quatro cards na seção "Nosso Impacto" ("100+ Cidades", "30+ Voluntários", etc.).
    *   **Hierarquia**: Contém `Image` (como ícone), `Heading` (para o valor) e `Text` (para o rótulo).
    *   **Detalhes de Estilo e Props (`StatCardProps`)**:
        *   `value`: '100+', '30+', etc.
        *   `label`: 'Cidades alcançadas...', 'Voluntários de todo o Brasil', etc.
        *   A ilustração é tratada como conteúdo customizado dentro do card, talvez via `slot`.
        *   `variant`: `'highlighted'` para o fundo amarelo.

*   **`FeatureCard.svelte`**
    *   **Descrição**: Card que detalha uma iniciativa ou funcionalidade.
    *   **Uso**: Cards na seção "Nossas Iniciativas" ("Mentoria de Oportunidades", "Clube dos Clássicos", etc.).
    *   **Hierarquia**: Contém `Image` (ilustração), `Heading` (título) e `Text` (descrição).
    *   **Detalhes de Estilo e Props (`FeatureCardProps`)**:
        *   `title`: 'Mentoria de Oportunidades', etc.
        *   `description`: 'Destinadas a vestibulares...' ou 'Lorem ipsum...'.
        *   `illustration`: `{ src: '...', alt: '...' }`.
        *   `orientation`: `'vertical'`.

*   **`TestimonialCard.svelte`**
    *   **Descrição**: Apresenta um depoimento de um cliente ou usuário.
    *   **Uso**: Cards na seção "Depoimentos".
    *   **Hierarquia**: Contém `Text` (para a citação), `Avatar` e mais dois `Text` (para nome e cargo do autor).
    *   **Detalhes de Estilo e Props (`TestimonialCardProps`)**:
        *   `quote`: O texto do depoimento "Lorem ipsum...".
        *   `author`: `{ name: 'Gabriela Saito Pereira', title: 'Estudante de Ciências Atuariais', avatar: '...' }`.
        *   `variant`: `'card'` (com fundo branco e sombra).

*   **`SectionHeader.svelte`**
    *   **Descrição**: Título padronizado para iniciar uma seção de conteúdo.
    *   **Uso**: Os títulos "Nosso Impacto", "Sobre Nós", "Nossas Iniciativas" e "Depoimentos".
    *   **Hierarquia**: Contém um átomo `Heading`. O estilo de fundo retangular é parte do CSS do componente.
    *   **Detalhes de Estilo e Props (`SectionHeaderProps`)**:
        *   `title`: 'Nosso Impacto', 'Sobre Nós', etc.
        *   `align`: `'center'` ou `'left'` dependendo da seção.
        *   `decorative`: `true`.

*   **`SocialLinks.svelte`**
    *   **Descrição**: Agrupamento de ícones de redes sociais.
    *   **Uso**: No rodapé da página.
    *   **Hierarquia**: Contém múltiplos átomos `Icon`, cada um dentro de um link.
    *   **Detalhes de Estilo e Props (`SocialLinksProps`)**:
        *   `links`: `[{ platform: 'facebook', url: '...' }, { platform: 'linkedin', url: '...' }, { platform: 'instagram', url: '...' }]`.
        *   `variant`: `'icons'`.
        *   `orientation`: `'horizontal'`.

---

### **3. Organismos (Organisms)**

Seções complexas e distintas da interface, compostas por moléculas e átomos.

*   **`Navigation.svelte`**
    *   **Descrição**: O cabeçalho principal da página.
    *   **Uso**: Fixo no topo da página.
    *   **Hierarquia**: Contém um átomo `Logo` e uma lista de moléculas `NavItem`.
    *   **Detalhes de Estilo e Props (`NavigationProps`)**:
        *   `items`: Array com os dados dos links de navegação.
        *   `logo`: Objeto de configuração do logo.
        *   `variant`: `'transparent'`.

*   **`HeroSection.svelte`**
    *   **Descrição**: A primeira seção visível, projetada para capturar a atenção do usuário.
    *   **Uso**: Topo da página.
    *   **Hierarquia**: Contém `Heading`, `Text`, `Button` e `Image` (átomos).
    *   **Detalhes de Estilo e Props (`HeroSectionProps`)**:
        *   `title`: "Guardiões da Educação...".
        *   `description`: "Somos um projeto educacional...".
        *   `actions`: Array com dados para os botões "Saiba Mais" e "Assista o Vídeo".
        *   O layout com duas ilustrações (cérebro e lâmpada) seria controlado por CSS dentro do organismo.

*   **`StatsSection.svelte`**
    *   **Descrição**: Seção que exibe métricas de impacto e um mapa.
    *   **Uso**: Segunda seção da página.
    *   **Hierarquia**: Contém `SectionHeader` (molécula), `Text` (átomo), `Image` (átomo - mapa) e uma grade de `StatCard` (moléculas).
    *   **Detalhes de Estilo e Props (`StatsSectionProps`)**:
        *   `title`: 'Nosso Impacto'.
        *   `description`: "Nosso projeto já alcançou...".
        *   `stats`: Array com os dados para cada `StatCard`.
        *   `layout`: `'grid'`.
        *   `columns`: `4`.

*   **`InitiativesSection.svelte`**
    *   **Descrição**: Seção que apresenta as principais iniciativas da organização.
    *   **Uso**: Quarta seção da página.
    *   **Hierarquia**: Contém `SectionHeader` (molécula), `Text` (átomo) e uma grade de `FeatureCard` (moléculas).
    *   **Detalhes de Estilo e Props (`InitiativesSectionProps`)**:
        *   `title`: 'Nossas Iniciativas'.
        *   `description`: 'Lorem ipsum dolor sit amet...'.
        *   `initiatives`: Array com os dados para cada `FeatureCard`.
        *   `layout`: `'grid'`.
        *   `columns`: `4`.

*   **`TestimonialsSection.svelte`**
    *   **Descrição**: Seção que exibe depoimentos para construir prova social.
    *   **Uso**: Quinta seção da página.
    *   **Hierarquia**: Contém `SectionHeader` (molécula), `Text` (átomo) e uma grade de `TestimonialCard` (moléculas).
    *   **Detalhes de Estilo e Props (`TestimonialsSectionProps`)**:
        *   `title`: 'Depoimentos'.
        *   `description`: 'Lorem ipsum dolor sit amet...'.
        *   `testimonials`: Array com os dados para cada `TestimonialCard`.
        *   `layout`: `'grid'`.
        *   `columns`: `2`.

*   **`Footer.svelte`**
    *   **Descrição**: O rodapé final da página com informações de contato, links e copyright.
    *   **Uso**: Final da página.
    *   **Hierarquia**: Contém `Logo` (átomo), `Text` (átomo), `SocialLinks` (molécula) e `Icon` (átomo - "voltar ao topo").
    *   **Detalhes de Estilo e Props (`FooterProps`)**:
        *   `logo`: Configuração do logo.
        *   `description`: "GEDUC é a maior ONG...".
        *   `contact`: `{ email: 'contato.geducbr@gmail.com' }`.
        *   `social`: Array com os dados das redes sociais.
        *   `copyright`: "© GEDUC Brasil".
        *   `backToTop`: `true`.
        *   `variant`: `'detailed'`.

---

### **4. Templates**

Estruturas que organizam os organismos em um layout de página.

*   **`HomePage` (implementado em `src/routes/+page.svelte`)**
    *   **Descrição**: Define o layout completo da página inicial, organizando todos os organismos sequencialmente.
    *   **Uso**: A própria página principal.
    *   **Hierarquia**: Contém os organismos `Navigation`, `HeroSection`, `StatsSection`, a seção "Sobre Nós" (que poderia ser um organismo `ContentSection`), `InitiativesSection`, `TestimonialsSection` e `Footer`.
    *   **Detalhes**: Este template seria responsável por buscar os dados (via `+page.ts` em SvelteKit) e passá-los como props para cada organismo. A propriedade `HomePageProps` define o contrato de dados completo para esta página.