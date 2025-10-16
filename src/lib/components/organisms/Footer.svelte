<!-- src/lib/components/organisms/Footer.svelte -->
<script lang="ts">
	import type { FooterProps } from '$lib/types/components';
	import Logo from '../atoms/Logo.svelte';
	import Text from '../atoms/Text.svelte';
	import Button from '../atoms/Button.svelte';
	import Icon from '../atoms/Icon.svelte';
	import Anchor from '../atoms/Anchor.svelte';
	import Heading from '../atoms/Heading.svelte';
	import SocialLinks from '../molecules/SocialLinks.svelte';
  
    export let logo: FooterProps['logo'] = undefined;
    export let description: FooterProps['description'] = undefined;
    export let contact: FooterProps['contact'] = undefined;
    export let social: FooterProps['social'] = [];
    export let links: FooterProps['links'] = [];
    export let newsletter: FooterProps['newsletter'] = undefined;
    export let copyright: FooterProps['copyright'] = undefined;
    export let backToTop: FooterProps['backToTop'] = false;
    export let variant: FooterProps['variant'] = 'detailed';
  
    // Classes adicionais
    let className = '';
    export { className as class };
  
    // Estado interno
    let newsletterEmail = '';
    let showBackToTop = false;
  
    // Classes CSS baseadas nas props
    $: classes = [
      'footer',
      `footer-variant-${variant}`,
      className
    ].filter(Boolean).join(' ');
  
    // Monitora scroll para mostrar botão voltar ao topo
    function handleScroll() {
      if (typeof window !== 'undefined') {
        showBackToTop = window.scrollY > 500;
      }
    }
  
    // Voltar ao topo
    function scrollToTop() {
      if (typeof window !== 'undefined') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
  
    // Submit newsletter
    function handleNewsletterSubmit(event: Event) {
      event.preventDefault();
      if (newsletter?.onSubmit && newsletterEmail.trim()) {
        newsletter.onSubmit(newsletterEmail.trim());
        newsletterEmail = '';
      }
    }
  
    // Mapeia social array para formato esperado pelo SocialLinks
    $: socialLinksData = social?.map(item => ({
      platform: item.platform as any,
      url: item.url,
      label: item.label
    })) || [];
  </script>
  
  <svelte:window on:scroll={handleScroll} />
  
  <footer class={classes}>
    <div class="footer-container">
      {#if variant === 'detailed'}
        <!-- Seção principal do footer -->
        <div class="footer-main">
          <!-- Coluna de informações principais -->
          <div class="footer-brand">
            {#if logo}
            <Logo
              variant="full"
              size="lg"
              interactive
              href={logo.href || '/'}
              src={logo.src}          
              alt={logo.alt || 'Logo'} 
              class="footer-logo"
              theme="dark"
            />
          {/if}
  
            {#if description}
              <Text as="p" size="md" color="white" class="footer-description">
                {description}
              </Text>
            {/if}
  
            {#if contact}
              <div class="footer-contact">
                                {#if contact.email}
                  <div class="footer-contact-item">
                    <Icon name="mail" size="sm" class="footer-contact-icon"/>
                    <Anchor size="sm" href={`mailto:${contact.email}`} class="footer-contact-link" color="inverse">
                      {contact.email}
                    </Anchor>
                  </div>
                {/if}

                {#if contact.phone}
                  <div class="footer-contact-item">
                    <Icon name="phone" size="sm" class="footer-contact-icon" />
                    <Anchor size="sm" href={`tel:${contact.phone}`} class="footer-contact-link" color="inverse">
                      {contact.phone}
                    </Anchor>
                  </div>
                {/if}
  
                {#if contact.address}
                  <div class="footer-contact-item">
                    <Icon name="map-pin" size="sm" class="footer-contact-icon" />
                    <Text as="span" size="sm" class="footer-contact-text" color="white">
                      {contact.address}
                    </Text>
                  </div>
                {/if}
              </div>
            {/if}
  
            {#if socialLinksData.length > 0}
              <SocialLinks
                links={socialLinksData}
                variant="icons"
                size="lg"
                orientation="horizontal"
                class="footer-social"
              />
            {/if}
          </div>
  
          <!-- Colunas de links -->
          {#if links && links.length > 0}
            <div class="footer-links">
              {#each links as linkGroup}
                <div class="footer-link-group">
                  <Heading level={3} size="md" weight="semibold" class="footer-link-title" color="white">
                    {linkGroup.title}
                  </Heading>
                  <ul class="footer-link-list">
                    {#each linkGroup.items as linkItem}
                      <li>
                        <Anchor
                          size="sm"
                          href={linkItem.href}
                          target={linkItem.external ? '_blank' : undefined}
                          external={linkItem.external}
                          class="footer-link-item"
                          color="inverse"
                        >
                          {linkItem.label}
                        </Anchor>
                      </li>
                    {/each}
                  </ul>
                </div>
              {/each}
            </div>
          {/if}
  
          <!-- Newsletter -->
          {#if newsletter}
            <div class="footer-newsletter">
              <Heading level={3} size="md" weight="semibold" class="footer-newsletter-title" color="white">
                {newsletter.title}
              </Heading>
  
              {#if newsletter.description}
                <Text as="p" size="sm" color="white" class="footer-newsletter-description">
                  {newsletter.description}
                </Text>
              {/if}
  
              <form on:submit={handleNewsletterSubmit} class="footer-newsletter-form">
                <input
                  type="email"
                  bind:value={newsletterEmail}
                  placeholder={newsletter.placeholder || 'Seu e-mail'}
                  required
                  class="footer-newsletter-input"
                />
                <Button type="submit" variant="primary" size="md" class="footer-newsletter-button">
                  Inscrever
                </Button>
              </form>
            </div>
          {/if}
        </div>
  
        <!-- Linha divisória -->
        <div class="footer-divider"></div>
      {/if}
  
      <!-- Seção de copyright -->
      <div class="footer-bottom">
        {#if copyright}
          <Text as="p" size="sm" color="white" class="footer-copyright">
            {copyright}
          </Text>
        {/if}
  
        {#if variant === 'simple' && socialLinksData.length > 0}
          <SocialLinks
            links={socialLinksData}
            variant="minimal"
            size="sm"
            orientation="horizontal"
            class="footer-bottom-social"
          />
        {/if}
      </div>
    </div>
  
    <!-- Botão voltar ao topo -->
    {#if backToTop && showBackToTop}
      <button
        class="footer-back-to-top"
        on:click={scrollToTop}
        aria-label="Voltar ao topo"
      >
        <Icon name="arrow-up" size="md" color="white" />
      </button>
    {/if}
  </footer>
  
  <style>
    .footer {
      position: relative;
      background-color: var(--color-primary-700);
      color: var(--text-color-inverse);
      margin-top: auto;
    }
  
    .footer-container {
      max-width: var(--container-max-width-xl);
      margin: 0 auto;
      padding: var(--spacing-2xl) var(--spacing-lg);
    }
  
    /* Variantes */
    .footer-variant-simple .footer-container {
      padding: var(--spacing-lg);
    }
  
    .footer-variant-minimal .footer-container {
      padding: var(--spacing-md) var(--spacing-lg);
    }
  
    /* Seção principal */
    .footer-main {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      gap: var(--spacing-2xl);
      margin-bottom: var(--spacing-xl);
    }
  
    /* Brand/Logo section */
    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }
  
    .footer-logo {
      color: var(--text-color-inverse);
    }
  
    .footer-description {
      max-width: 300px;
      line-height: var(--line-height-relaxed);
    }
  
    /* Contato */
    .footer-contact {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }
  
    .footer-contact-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
  
    .footer-contact-icon {
      color: var(--color-accent-400);
      flex-shrink: 0;
    }
  
    .footer-contact-link {
      text-decoration: none;
      transition: color var(--transition-fast) var(--transition-timing-default);
    }
  
    .footer-contact-link:hover {
      text-decoration: underline;
    }
  
    .footer-contact-text {
    }
  
    /* Social */
    .footer-social {
      margin-top: var(--spacing-md);
    }
  
    /* Links */
    .footer-links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-xl);
    }
  
    .footer-link-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }
  
    .footer-link-title {
      margin-bottom: var(--spacing-sm);
    }
  
    .footer-link-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }
  
    .footer-link-item {
      text-decoration: none;
      transition: all var(--transition-fast) var(--transition-timing-default);
      position: relative;
      padding-left: var(--spacing-md);
    }
  
    .footer-link-item::before {
      content: '→';
      position: absolute;
      left: 0;
      opacity: 0;
      transition: opacity var(--transition-fast) var(--transition-timing-default);
    }
  
    .footer-link-item:hover {
      color: var(--color-accent-400);
      transform: translateX(var(--spacing-xs));
    }
  
    .footer-link-item:hover::before {
      opacity: 1;
    }
  
    /* Newsletter */
    .footer-newsletter {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }
  
    .footer-newsletter-title {
      color: var(--text-color-inverse);
    }
  
    .footer-newsletter-description {
      line-height: var(--line-height-relaxed);
    }
  
    .footer-newsletter-form {
      display: flex;
      gap: var(--spacing-sm);
      flex-direction: column;
    }
  
    .footer-newsletter-input {
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--color-primary-500);
      border-radius: var(--border-radius-md);
      background-color: var(--color-primary-600);
      color: var(--text-color-inverse);
      font-size: var(--font-size-sm);
      transition: all var(--transition-fast) var(--transition-timing-default);
    }
  
    .footer-newsletter-input::placeholder {
      color: var(--color-neutral-400);
    }
  
    .footer-newsletter-input:focus {
      outline: none;
      border-color: var(--color-accent-400);
      background-color: var(--color-primary-500);
      box-shadow: 0 0 0 2px rgba(255, 235, 59, 0.2);
    }
  
    .footer-newsletter-button {
      align-self: flex-start;
    }
  
    /* Divider */
    .footer-divider {
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--color-primary-500) 50%,
        transparent 100%
      );
      margin: var(--spacing-xl) 0;
    }
  
    /* Bottom section */
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--color-primary-600);
    }
  
    .footer-variant-simple .footer-bottom,
    .footer-variant-minimal .footer-bottom {
      border-top: none;
      padding-top: 0;
    }
  
    .footer-copyright {
      margin: 0;
    }
  
    .footer-bottom-social {
      margin-left: auto;
    }
  
    /* Back to top button */
    .footer-back-to-top {
      position: fixed;
      bottom: var(--spacing-lg);
      right: var(--spacing-lg);
      width: 48px;
      height: 48px;
      background-color: var(--color-primary-500);
      border: none;
      border-radius: var(--border-radius-full);
      color: var(--text-color-inverse);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-lg);
      transition: all var(--transition-fast) var(--transition-timing-default);
      z-index: 1000;
      animation: slideUp 0.3s ease-out;
    }
  
    .footer-back-to-top:hover {
      background-color: var(--color-primary-600);
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }
  
    .footer-back-to-top:focus-visible {
      outline: 2px solid var(--color-accent-400);
      outline-offset: 2px;
    }
  
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  
    /* Responsividade */
    @media (max-width: 1024px) {
      .footer-main {
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-xl);
      }
  
      .footer-newsletter {
        grid-column: 1 / -1;
      }
    }
  
    @media (max-width: 768px) {
      .footer-container {
        padding: var(--spacing-xl) var(--spacing-md);
      }
  
      .footer-main {
        grid-template-columns: 1fr;
        gap: var(--spacing-lg);
      }
  
      .footer-bottom {
        flex-direction: column;
        gap: var(--spacing-md);
        text-align: center;
      }
  
      .footer-bottom-social {
        margin-left: 0;
      }
  
      .footer-newsletter-form {
        flex-direction: row;
      }
  
      .footer-newsletter-input {
        flex: 1;
      }
  
      .footer-back-to-top {
        bottom: var(--spacing-md);
        right: var(--spacing-md);
        width: 40px;
        height: 40px;
      }
    }
  
    @media (max-width: 480px) {
      .footer-container {
        padding: var(--spacing-lg) var(--spacing-sm);
      }
  
      .footer-newsletter-form {
        flex-direction: column;
      }
  
      .footer-newsletter-button {
        align-self: stretch;
      }
    }
  
    /* Dark theme adjustments */
    [data-theme="dark"] .footer {
      background-color: var(--color-neutral-900);
    }
  
    [data-theme="dark"] .footer-newsletter-input {
      background-color: var(--color-neutral-800);
      border-color: var(--color-neutral-700);
    }
  
    [data-theme="dark"] .footer-newsletter-input:focus {
      background-color: var(--color-neutral-700);
      border-color: var(--color-primary-500);
    }
  
    [data-theme="dark"] .footer-bottom {
      border-top-color: var(--color-neutral-800);
    }
  
    [data-theme="dark"] .footer-divider {
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--color-neutral-800) 50%,
        transparent 100%
      );
    }
  
    /* Animações */
    .footer {
      animation: slideUp 0.8s ease-out;
    }
  
    /* Estados de hover para diferentes variantes */
    .footer-variant-detailed:hover .footer-social {
      transform: scale(1.05);
      transition: transform var(--transition-fast) var(--transition-timing-default);
    }
  
    /* Efeitos decorativos */
    .footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(
        90deg,
        var(--color-primary-500),
        var(--color-secondary-500),
        var(--color-accent-500)
      );
      background-size: 200% 100%;
      animation: gradientMove 4s ease-in-out infinite;
    }
  
    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  </style>