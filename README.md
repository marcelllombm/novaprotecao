# Nova Proteção — landing page

Página única em **HTML, CSS e JavaScript**, sem framework e sem dependências de execução em servidor. Imagens, fontes e Motion estão incluídos no projeto.

## Abrir localmente

Na pasta `landing-page`, execute:

```sh
python3 -m http.server 4173
```

Abra **http://localhost:4173**. Também é possível abrir `index.html` diretamente; a cópia para a área de transferência poderá pedir uma ação manual nesse modo.

## Onde editar

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Seções, títulos, textos, perguntas frequentes e estrutura acessível. |
| `css/styles.css` | Tokens de cores, tipografia, componentes e regras responsivas. As seções estão identificadas e numeradas. |
| `js/config.js` | Nome da marca e WhatsApp comercial. |
| `js/content.js` | Conteúdo das opções carro/moto e das proteções interativas. |
| `js/main.js` | Menu, seletores, validação, diálogos, pedido de cotação e animações. |
| `assets/images/` | Logo original, fotografias geradas, versões WebP e favicon. |
| `assets/fonts/` | Sora e Manrope, hospedadas localmente, com licenças OFL. |
| `assets/vendor/` | Motion 12.23.24 para JavaScript, com licença MIT. |
| `scripts/build.mjs` | Copia os arquivos públicos para `dist/`, sem empacotar ou minificar o código. |
| `docs/design.md` | Direção visual e decisões de conteúdo. |
| `docs/imagens.md` | Origem, arquivos e prompts das imagens. |

## Ativar o WhatsApp

Em `js/config.js`, preencha `whatsappNumber` com o número **real**, usando país + DDD + número, somente dígitos. O formato esperado é `55` seguido de 10 ou 11 dígitos.

Com um número válido, o resumo passa a mostrar o botão **Continuar no WhatsApp**. O visitante continua responsável por confirmar o envio no aplicativo. Nenhuma mensagem é enviada automaticamente.

Sem número, o formulário funciona como um preparador de pedido: valida os campos, apresenta o resumo e oferece **Copiar pedido** e **Baixar pedido em texto**. Não finge enviar os dados. O contato ausente é explicado no resumo.

Não há backend, banco de dados, envio por e-mail, analytics ou persistência em localStorage. Os dados ficam apenas na memória da página. Ao configurar integrações futuras, atualize também o texto de privacidade.

## Publicar em hospedagem estática

```sh
node scripts/build.mjs
```

Envie o conteúdo de `dist/` para uma hospedagem estática. Os PNGs originais são preservados para manutenção, mas não vão para `dist/`. Os arquivos WebP são utilizados pelo site.

Para publicar em outro domínio, atualize `og:image` no HTML. O arquivo `.openai/hosting.json` identifica a prévia no Sites; preserve seu `project_id` ao atualizar a mesma prévia.

## Conteúdo comercial

Foram incluídos os serviços informados: carro, moto, assistência 24h/guincho, roubo e furto, perda total, terceiros e rastreador. Não foram criados preços, depoimentos, estatísticas de clientes, endereços, números de assistência ou promessas de indenização. Os detalhes comerciais e limites devem ser ajustados aos planos reais da empresa antes de uma campanha pública.

## Acessibilidade e animações

- Navegação por teclado, link para pular conteúdo e foco visível.
- Seletor de veículo com semântica de abas e teclas direcionais.
- Perguntas frequentes com `details` e `summary` nativos.
- Diálogos nativos, fechamento por Escape e restauração de foco.
- Erros do formulário em cada campo e em um resumo focável.
- Respeito a `prefers-reduced-motion`.
- Motion é uma melhoria progressiva: sua ausência não bloqueia nenhuma funcionalidade.
- Conteúdo e arquivos locais; sem recursos de CDN em tempo de navegação.

Referência da animação: [Motion para JavaScript](https://motion.dev/docs/quick-start).
