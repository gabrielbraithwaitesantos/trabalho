# Duda's Lingerie - E-commerce com Firebase

Projeto web de e-commerce de lingerie em JavaScript usando:

- Vite (dev server e build)
- Firebase SDK modular
- Firestore para catalogo de produtos

## Recursos de UI implementados

- Estrutura multipagina (nao e mais tudo em uma tela)
- Home profissional com destaque de marca e vitrine inicial
- Pagina de produtos com filtros, busca, ordenacao e paginacao
- Pagina de login separada
- Pagina de carrinho separada
- Header e footer compartilhados em todas as paginas
- Carrinho persistente no navegador (localStorage)
- Sessao de usuario persistente no navegador (localStorage)
- Catalogo integrado ao Firestore com fallback local

## 1) Instalar dependencias

```bash
npm install
```

## 2) Rodar em desenvolvimento

```bash
npm run dev
```

Abra o endereco mostrado no terminal (normalmente `http://localhost:5173`).

## 3) Build de producao

```bash
npm run build
npm run preview
```

## Firebase ja conectado

A configuracao do Firebase foi adicionada em `src/firebase.js` com o `initializeApp(firebaseConfig)`.

O catalogo tenta ler primeiro a colecao `products` no Firestore. Se nao houver dados, usa fallback local.

## Logo da marca

Para a logo aparecer automaticamente no topo do site, coloque o arquivo em `public/logo.png`.

Tambem sao aceitos os nomes:

- `public/logo.jpg`
- `public/logo.jpeg`
- `public/logo.webp`
- `public/logo.svg`
- `public/dudas-logo.png`
- `public/dudas-lingerie-logo.png`

## Como alimentar o catalogo no Firestore

1. No console do Firebase, crie o Firestore Database (modo de teste no inicio).
2. Crie a colecao `products`.
3. Adicione documentos com campos como:

```json
{
	"title": "Conjunto Aurora Lace",
	"category": "Conjuntos",
	"price": 129.9,
	"image": "https://...",
	"badge": "Mais vendido"
}
```

Quando a colecao `products` estiver vazia (ou sem acesso), a aplicacao usa um catalogo local de fallback para nao quebrar a tela.

## Login e carrinho
oi
- O login agora usa Firebase Authentication (e-mail/senha) de forma real.
- A tela de login permite entrar ou criar conta diretamente.
- A tela de login tambem suporta "Entrar com Google".
- No console do Firebase, habilite Authentication > Sign-in method > Email/Password.
- Para Google, habilite Authentication > Sign-in method > Google.
- Em Authentication > Settings > Authorized domains, adicione seu dominio de desenvolvimento (ex.: localhost e dominio do Codespaces).
- O carrinho tambem e persistido localmente para manter os itens entre recarregamentos.
- Para producao, o proximo passo natural e integrar checkout real.

## Conta admin e cadastro de produtos

- O cadastro de produtos fica em pagina separada: `/admin.html`.
- O link "Admin" no menu aparece somente para conta com permissao de administrador.
- A pagina admin libera o formulario apenas para conta admin.
- Para liberar permissao de admin, adicione um documento com o UID do usuario em `admins/{uid}` no Firestore.
- Depois disso, recarregue o site e acesse a pagina admin para cadastrar produtos.

Exemplo de estrutura para a colecao `admins`:

```json
{
	"enabled": true,
	"label": "Administrador principal"
}
```

## Paginas disponiveis

- `/index.html`: pagina inicial
- `/products.html`: vitrine completa de produtos
- `/admin.html`: cadastro de produtos (apenas admin)
- `/login.html`: area de login
- `/cart.html`: carrinho e resumo do pedido

## Estrutura

- `index.html`: pagina inicial
- `products.html`: pagina de produtos
- `admin.html`: pagina de administracao
- `login.html`: pagina de login
- `cart.html`: pagina de carrinho
- `src/firebase.js`: inicializacao do Firebase e Firestore
- `src/pages/`: scripts por pagina
- `src/shared/`: modulos compartilhados (layout, catalogo, storage, etc)
- `src/styles/`: estilos globais e por pagina
- `vite.config.js`: entradas multipagina do build (home, produtos, login e carrinho)