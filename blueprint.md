
# Visão Geral do Projeto

Este é um aplicativo Next.js integrado ao Firebase, projetado para ser uma plataforma de mentoria e avaliação de redações. Ele oferece funcionalidades distintas para alunos e professores, com um sistema de autenticação robusto e recursos interativos, como agendamento de mentorias e submissão de avaliações.

# Funcionalidades e Design

## Design e Estilo

- **Interface Moderna e Intuitiva**: O aplicativo utiliza um design clean e moderno, com componentes reutilizáveis que garantem uma experiência de usuário consistente.
- **Componentes Interativos**: São usados ícones, botões com efeitos de "glow", e um layout responsivo que se adapta a diferentes tamanhos de tela.
- **Paleta de Cores Vibrante**: Uma gama de cores é usada para criar uma aparência energética e para destacar elementos interativos.
- **Feedback Visual**: O design inclui texturas sutis e sombras para criar profundidade e uma sensação tátil premium.

## Funcionalidades

- **Autenticação Segura**: Gerenciamento de autenticação do lado do servidor com `firebase-admin`, separando as credenciais de cliente e servidor para maior segurança.
- **Perfis de Usuário (Aluno e Professor)**: O sistema diferencia os tipos de usuário, oferecendo dashboards e funcionalidades específicas para cada um.
- **Agendamento de Mentorias**: Alunos podem agendar mentorias com professores, que por sua vez podem gerenciar suas agendas.
- **Avaliação de Redações**: Alunos podem enviar redações para avaliação, e professores podem corrigi-las usando critérios predefinidos.
- **Dashboards Interativos**: Painéis que exibem informações relevantes, como o progresso do aluno, médias de notas e temas de redação.
- **Navegação Intuitiva**: Uma barra lateral e outros controles de navegação facilitam o acesso às diferentes seções do aplicativo.

# Plano de Alterações Atuais

## Objetivo

Refatorar a inicialização do Firebase para usar o `firebase-admin` no lado do servidor, garantindo que as credenciais sensíveis não fiquem expostas no lado do cliente. Isso aumenta a segurança e segue as melhores práticas do Next.js para o gerenciamento de configurações de servidor.

## Passos Executados

1.  **Instalação do `firebase-admin`**:
    - O pacote `firebase-admin` foi adicionado ao projeto para permitir a comunicação segura com os serviços do Firebase no lado do servidor.

2.  **Criação do `lib/firebase-admin.ts`**:
    - Foi criado um novo arquivo para encapsular a inicialização do Firebase Admin SDK.
    - Este arquivo garante que o SDK seja inicializado apenas uma vez e utiliza variáveis de ambiente (`process.env`) para carregar as credenciais do projeto, como `FIREBASE_PROJECT_ID` e `FIREBASE_PRIVATE_KEY`.
    - As instâncias de `firestore`, `auth`, e `storage` do admin são exportadas para uso em Server Actions e outras lógicas de servidor.

3.  **Atualização do `lib/firebase.ts`**:
    - O arquivo de inicialização do Firebase no lado do cliente foi modificado para carregar sua configuração a partir de variáveis de ambiente com o prefixo `NEXT_PUBLIC_`.
    - Isso remove as credenciais fixas do código e permite uma configuração mais flexível e segura, alinhada com as práticas do Next.js.
