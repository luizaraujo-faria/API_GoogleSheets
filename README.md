# API Para o APP-IMREA

- Este software backend, uma API que se comunica com a API do GoogleSheet e o utiliza como armazenamento de dados.

- Pensada e construída para servir o aplicativo mobile App-IMREA utilizado dentro da instituição Lucy Montoro, onde a API ajudará no consumo e envio de dados, permitindo a otimização da gestão e do fluxo de movimentação dentro do refeitório do instituto.

# Ferramentas / Técnologias

- Node.js (TypeScript)
- Express.js
- GoogleSheetsAPI
- Zod
- .Env
- Pnpm

# Arquitetura / Organização

- Foi escolhida e utilizada a arquitetura MVC com traços da arquitetura em Camadas, também desenvolvido utilizando Programação Orientada a Objetos. Permitindo separar e organizar Funções, Classes e outros componentes de acordo com sua responsabilidade.


(Pasta principal)
- src/
    ├── config/ - Guarda principalmente a configuração da GoogleSheetsAPI.
    ├── constansts/ - Guarda objetos ou estrutura com valores constantes reutilizáveis.
    ├── controllers/ - Controladores dos endpoints.
    ├── errors/ - Classes de erros personalizados.
    ├── responses/ - Classes de respostas personalizadas.
    ├── routes/ - Rotas dos endpoints da aplicação.
    ├── services/ - Regras de negócio de cada entidade e endpoint.
    ├── types/ - Tipos e entidades da aplicação (models).
    ├── utils/ - Funções e clases utilitárias da aplicação.

    ├── server.ts - Arquivo principal de configuração e execução do servidor.

(Pasta local necessária)
- credentials/ - Deve conter o arquivo .json de credenciais da sua planilha utilizada no GoogleSheets para configurar a GoogleSheetsAPI na aplicação.

- O documento .json é restrito, portanto a pasta deve ser mantida em segurança localmente no .env e configurada em variaveis de ambiente quando for hospedar a API.

# Instalação / Execução

- git clone https://github.com/luizaraujo-faria/API_GoogleSheets.git
- cd API_GoogleSheets

- pnpm install - Instala todas as dependencias
- pnpm dev - Executa a aplicação

# ©2025 - IMREA Rede Lucy Montoro - Luiz H. Araujo