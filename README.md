# Xandinho

Protótipo da Global Solution 2026.2 da FIAP (tema CitizenTech). O Xandinho é um assistente virtual que conversa com a pessoa, calcula a renda por pessoa da família e mostra, num relatório, quais programas sociais ela provavelmente tem direito, com o que fazer, o que levar e onde ir.

O relatório é uma orientação automática. Ele não garante o acesso a nenhum benefício. O Xandinho é um roteiro fixo de perguntas sem inteligência artificial por trás.

## Como abrir

1. Baixe ou clone a pasta do projeto.
2. Abra o arquivo `index.html` direto no navegador.

Site publicado: link a incluir (GitHub Pages).

## Estrutura

```
index.html       Início: problema com dado real, como funciona, ODS e programas verificados
solucao.html     Conversa com o Xandinho e relatório final
impacto.html     Tamanho do problema, como medimos e próximos passos
equipe.html      Integrantes, links e formulário de contato
css/style.css    Estilos, mobile-first, em tela cheia
js/comum.js      Comum a todas as páginas: menu no celular, topo e formatação de valores
js/direitos.js   Array com 13 programas e oportunidades, e a regra de cada um
js/conversa.js   Roteiro da conversa e geração do relatório
js/consultas.js  Salário mínimo (Banco Central) e cidade pelo CEP (ViaCEP)
js/inicio.js     Lista dos programas na página inicial
js/contato.js    Formulário de contato, que abre o WhatsApp da equipe
img/             Avatar do Xandinho e favicon
```

## Tecnologias

HTML, CSS e JavaScript puros, sem frameworks. Fontes Bricolage Grotesque e Atkinson Hyperlegible, do Google Fonts.

## Como o protótipo atende aos requisitos

| Requisito | Onde |
| --- | --- |
| Página inicial com o problema | `index.html`: cidadão, dado real com fonte (260 mil domicílios do ES sem a tarifa social de água), proposta e ODS |
| Navegação | Quatro páginas com o mesmo menu e HTML semântico |
| Simulação interativa | `solucao.html`: a conversa avalia o array de 13 registros de `js/direitos.js` e monta o relatório pelo DOM. A página inicial também exibe o array |
| Formulário com validação | `equipe.html`: contato com campos obrigatórios e mensagens de erro e sucesso na página, sem `alert()`. Ao enviar, abre o WhatsApp da equipe com a mensagem pronta. As respostas da conversa também são validadas |
| Responsividade | Mobile-first, media queries, flexbox e grid |
| Acessibilidade | Tags semânticas, `alt`, `label` em todos os campos, contraste, teclado, link para pular ao conteúdo |
| Diferenciais | Botão "Alterar" em cada resposta, relatório para imprimir, salvar em PDF ou enviar pelo WhatsApp |

## Catálogo de direitos

11 direitos (Cadastro Único, conta de luz gratuita, desconto na conta de luz, desconto na conta de água, gás de cozinha gratuito, Bolsa Família, benefício para pessoa idosa e para pessoa com deficiência, poupança do ensino médio, passagem gratuita para pessoa idosa e remédios gratuitos) e 2 oportunidades para quem empreende (microcrédito produtivo orientado e cursos do Sebrae). Cada registro tem a regra, o que fazer, o que levar, onde ir, a fonte e a data da consulta (novembro de 2026).

Cada programa volta como "provável direito", "falta um passo" (por exemplo, o Cadastro Único) ou "não se aplica agora". Os limites que dependem do salário mínimo (um quarto, meio, um e dois salários mínimos) são calculados com o valor obtido do Banco Central.

## APIs

| API | Uso | Plano B |
| --- | --- | --- |
| Banco Central, SGS 1619 | Salário mínimo vigente | R$ 1.621, valor de 2026 guardado no site |
| ViaCEP | Cidade a partir do CEP | O Xandinho pergunta a cidade |
| wa.me | Enviar o resumo do relatório pelo WhatsApp 

## Aviso de responsabilidade

Todo relatório termina com um aviso: a orientação é automática, baseada nas respostas da pessoa e nas regras públicas consultadas, não garante o acesso a benefícios, não substitui a análise dos órgãos responsáveis e deve ser confirmada nos canais oficiais ou no CRAS.

## Integrantes

| Nome | RM |
| --- | --- |
| Carlos Emmanuel Barbosa da Silva | RM 572114 |
| Matheus Henrique Prioli | RM 573619 |
| Pedro Jorge Cardoso Reis | RM 573144 |
| Rodrigo Macimo da Silva | RM 572581 |
| Murilo Vieira Nascimento | RM 571584 |

## Vídeo pitch

Link a incluir.
