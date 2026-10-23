# **TXENEZA WEB: PLATAFORMA DE GESTÃO ADMINISTRATIVA E ANÁLISE GEOESPACIAL URBANA**

## **Visão geral da solução**

A plataforma Txeneza Web constitui o centro operacional e administrativo do ecossistema municipal de gestão cívica e saneamento urbano. Desenvolvida para responder aos desafios de monitorização de resíduos sólidos, ocorrências ambientais e infraestruturas na Cidade da Beira (Conselho Municipal da Beira), a aplicação permite que os serviços técnicos municipais e os gestores operacionais processem, priorizem e resolvam os incidentes reportados pelos cidadãos através da aplicação móvel.

O sistema integra processamento analítico em tempo real, cartografia interativa avançada e verificação automatizada de resoluções, transformando denúncias individuais em inteligência territorial para a administração pública.

## **Objetivos do projeto**

1. Centralizar o ciclo de vida das ocorrências urbanas, desde o registo cívico até à confirmação de intervenção no terreno.
2. Fornecer visibilidade geoespacial sobre áreas críticas de acumulação de resíduos através de mapas de calor e análise de densidade.
3. Assegurar a transparência na atuação municipal, registando evidências fotográficas, notas técnicas e prazos de resolução.
4. Automatizar a comunicação com os munícipes através de notificações push quando o estado das suas denúncias é atualizado.
5. Otimizar a afetação de equipas municipais e viaturas de recolha através de dados de localização consolidados.

## **Arquitetura técnica e tecnologias**

A solução assenta numa arquitetura modular baseada em TypeScript e Next.js, estruturada nas seguintes camadas tecnológicas:

- **Estrutura e interface**: Next.js (App Router com React 19), tirando partido de Server Components para renderização eficiente e Server Actions para mutações de dados seguras.
- **Base de dados e tempo real**: Supabase PostgreSQL gerido com políticas de segurança ao nível da linha (Row Level Security), canais de subscrição em tempo real e armazenamento distribuído de ficheiros (Supabase Storage).
- **Mapeamento objeto-relacional**: Prisma ORM acoplado a pools de ligações com suporte ao adaptador nativo de PostgreSQL.
- **Cartografia e análise geoespacial**: Mapbox GL e React Map GL com suporte a mapas de calor, interpolação territorial, agrupamentos dinâmicos (*clustering*) e validação de geometrias com recurso à biblioteca Turf.js.
- **Inteligência artificial**: Google Gemini API, integrada exclusivamente no servidor para comparação visual e validação de autenticidade entre as fotografias originais da denúncia e as fotografias da intervenção técnica.
- **Despacho de notificações**: Firebase Admin SDK para envio de mensagens push cifradas para dispositivos móveis Android e iOS.
- **Visualização analítica e estado**: AG Charts Community e Zustand para renderização de relatórios executivos e gestão do estado global da interface.

## **Estrutura de módulos do sistema**

O código-fonte está organizado por domínios de negócio no diretório `src/features`:

- `occurrences`: Módulo de triagem, detalhe técnico, alteração de estados (Pendente, Em Análise, Em Resolução, Resolvido) e verificação fotográfica de desfecho.
- `map`: Módulo cartográfico de alta fidelidade com camadas de mapa de calor, filtros de estado, seleção por raio geográfico e visualização de pontos de recolha.
- `collection-points`: Módulo de inventário, monitorização e manutenção de contentores e pontos municipais de deposição de resíduos.
- `dashboard`: Módulo de controlo executivo com indicadores operacionais, taxas de resolução por distrito e séries temporais de ocorrências.
- `notifications`: Módulo de receção e difusão de eventos de alteração de estado no sistema em tempo real.
- `reports`: Módulo de exportação de dados agregados nos formatos PDF e Excel para relatórios institucionais.
- `auth`: Controlo de autenticação institucional e gestão de perfis de utilizador com restrições de permissão.

## **Configuração de variáveis de ambiente**

O sistema depende de variáveis de configuração que devem ser definidas no ficheiro `.env.local` na raiz do projeto. O modelo de referência está estruturado no ficheiro `.env.example`:

| Variável | Finalidade técnica | Âmbito |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Endereço base da interface web | Público |
| `NEXT_PUBLIC_SUPABASE_URL` | Ponto de terminação da instância Supabase | Público |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave de acesso anónima com restrições RLS | Público |
| `DATABASE_URL` | Cadeia de ligação ao PostgreSQL com pgBouncer | Servidor |
| `DIRECT_URL` | Cadeia de ligação direta para migrações Prisma | Servidor |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Credencial de acesso aos azulejos e estilos Mapbox | Público |
| `FIREBASE_PROJECT_ID` | Identificador do projeto Firebase para notificações push | Servidor |
| `FIREBASE_CLIENT_EMAIL` | Conta de serviço autorizada para a API FCM | Servidor |
| `FIREBASE_PRIVATE_KEY` | Chave privada da conta de serviço Firebase | Servidor |
| `GEMINI_API_KEY` | Credencial do Google AI para validação de imagens | Servidor |

As credenciais do Firebase e do Gemini possuem natureza estritamente confidencial e nunca devem receber o prefixo `NEXT_PUBLIC_`, evitando a sua inclusão no pacote transferido pelos navegadores clientes.

## **Procedimentos de execução e desenvolvimento**

Para executar o ambiente local de desenvolvimento, são necessários os seguintes passos:

1. Instalação das dependências do ecossistema Node.js:
   ```bash
   npm install
   ```

2. Geração do cliente de dados e verificação do esquema Prisma:
   ```bash
   npx prisma generate
   ```

3. Inicialização do servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Aceder à plataforma através do endereço `http://localhost:3000`.

Para validar a integridade estrutural e compilar a distribuição de produção:
```bash
npm run build
npm run start
```
