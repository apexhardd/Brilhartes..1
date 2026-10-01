# Brilhartes — site de encomendas

## Arquivos
- `index.html`: estrutura do site
- `style.css`: identidade visual responsiva
- `script.js`: Firebase Auth, Firestore, catálogo e pedidos
- `firestore.rules`: regras de acesso sugeridas

## Configuração Firebase
1. Crie um projeto no Firebase Console.
2. Em Authentication > Sign-in method, habilite Email/Password.
3. Em Authentication > Settings > Authorized domains, adicione seu domínio GitHub Pages (ex.: `usuario.github.io`).
4. Crie um banco Firestore em modo de produção.
5. Em configurações do projeto, registre um app Web e copie os campos de configuração para `firebaseConfig` em `script.js`.
6. Substitua `SEU_EMAIL_ADMIN@exemplo.com` pelo e-mail administrativo tanto em `script.js` quanto em `firestore.rules`.
7. Publique as regras de `firestore.rules` no console do Firestore.
8. Defina `WHATSAPP_NUMBER` com DDI+DDD+número, somente dígitos.
9. Publique os arquivos no repositório GitHub e ative Settings > Pages > Deploy from a branch > main > /(root).

## Segurança importante
- A configuração Firebase Web (incluindo apiKey) identifica o projeto, mas não substitui regras de segurança. Nunca coloque service account, chave privada ou segredo administrativo no JavaScript público.
- Regras Firestore são a barreira de autorização. Revise/teste as regras no Emulator Suite antes de aceitar clientes reais.
- O painel de admin deste exemplo usa o e-mail autenticado como verificação nas regras. Para produção, prefira custom claims concedidas por ambiente confiável/Cloud Functions; não permita que o próprio cliente atribua a si a função admin.
- Habilite proteção contra abuso, limite métodos de login e configure orçamento/alertas do Firebase.
- Não colete dados desnecessários. Use HTTPS (GitHub Pages fornece HTTPS).
- Os preços e produtos apresentados são exemplos; atualize-os conforme sua operação.
- O pedido abre WhatsApp após salvar no Firestore; revise número e mensagem antes de publicar.

## Teste
Use um servidor local (VS Code Live Server ou `python -m http.server`) em vez de abrir `index.html` por `file://`, pois os módulos ES precisam de origem HTTP/HTTPS.
