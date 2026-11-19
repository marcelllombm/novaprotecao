# Verificação da entrega

Verificação local realizada em 17/11/2026, no Chrome, com automação via Playwright.

- Sem rolagem horizontal em 320, 375, 390, 768, 1024, 1440 e 1920 px.
- Sem erros de JavaScript e sem respostas HTTP de erro para os recursos do site.
- Imagens carregadas, links internos válidos e IDs sem duplicidade.
- Abas de carro/moto funcionando por clique e teclado; sincronização com a cotação.
- Quatro opções de proteção atualizando os detalhes.
- Perguntas frequentes abrindo e fechando.
- Menu móvel operável, com fechamento por Escape e pelos links.
- Campos inválidos identificados individualmente, com foco no resumo de erros.
- Pedido válido revisável em diálogo; cópia e download do texto verificados.
- Fechamento de diálogos por Escape e retorno do foco ao acionador.
- Caminho de WhatsApp configurado verificado em memória, sem abrir o link nem enviar mensagens. O número de teste não foi salvo no site.
- Modo sem telefone real: aviso de ausência do contato e nenhuma simulação de envio.
- Movimento reduzido sem animações em execução.
- Sem persistência dos dados do formulário em localStorage.
- Axe Core 4.10.3: **zero violações detectadas** nos critérios automatizados WCAG 2 A/AA e 2.1 AA, em desktop e celular, após correção do contraste do aviso de privacidade.

A auditoria automatizada não substitui uma avaliação completa com tecnologias assistivas. As capturas de desktop e celular também foram inspecionadas visualmente.

Os arquivos JavaScript passaram por verificação de sintaxe com `node --check`.
