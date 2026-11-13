/* Conversa com o Xandinho e geração do relatório de direitos.
   É um roteiro fixo de perguntas, sem inteligência artificial por trás.
   Nada do que a pessoa digita sai do navegador. */
(function (Xandinho) {
  'use strict';

  var moeda = Xandinho.formatarMoeda;
  var estado = { respostas: {}, ocupado: false, salarioMinimo: Xandinho.SALARIO_MINIMO_PADRAO };

  /* ---------- Roteiro de perguntas ---------- */
  function simOuNao() { return [['sim', 'Sim'], ['nao', 'Não']]; }

  var PERGUNTAS = [
    { id: 'nome', tipo: 'texto', resumo: 'Nome', limpar: true,
      texto: function () { return 'Pra começar, como posso te chamar?'; },
      validar: function (v) { return v.length < 2 ? 'Digite o seu nome, só com letras.' : ''; } },
    { id: 'cep', tipo: 'texto', resumo: 'CEP', teclado: 'numeric', exemplo: '00000-000', alternativa: [null, 'Não sei o CEP'],
      texto: function (r) { return 'Prazer, ' + r.nome + '! Qual é o CEP da sua casa? Com ele eu descubro a sua cidade.'; },
      validar: function (v) { return v.replace(/\D/g, '').length !== 8 ? 'O CEP tem 8 números, como 29140-000.' : ''; },
      depois: function (v) {
        if (v === null) { return Promise.resolve(); }
        return Xandinho.buscarCidade(v.replace(/\D/g, '')).then(function (cidade) {
          estado.respostas.cidade = cidade;
          return falar('Encontrei: ' + cidade + '.');
        }).catch(function () {
          return falar('Não consegui consultar esse CEP agora. Sem problema, vou te perguntar a cidade.');
        });
      } },
    { id: 'cidade', tipo: 'texto', resumo: 'Cidade', limpar: true,
      texto: function () { return 'Em qual cidade você mora?'; },
      validar: function (v) { return v.length < 2 ? 'Digite o nome da cidade.' : ''; } },
    { id: 'pessoas', tipo: 'inteiro', resumo: 'Pessoas na casa', minimo: 1, maximo: 20,
      texto: function () { return 'Quantas pessoas moram na sua casa, contando com você?'; } },
    { id: 'renda', tipo: 'moeda', resumo: 'Renda da família por mês', aceitaZero: true,
      texto: function () { return 'Somando tudo o que as pessoas da casa ganham por mês, quanto dá? Conte salários, bicos, aposentadorias e pensões. Não conte o dinheiro que vem de programas sociais do governo.'; },
      depois: function (v, r) { return falar('Isso dá ' + moeda(v / r.pessoas) + ' por pessoa da família. É esse número que os programas usam.'); } },
    { id: 'cadastro', tipo: 'opcoes', resumo: 'Cadastro Único',
      texto: function () { return 'A família está no Cadastro Único, o cadastro dos programas sociais do governo?'; },
      opcoes: function () { return [['atualizado', 'Sim, atualizado nos últimos 2 anos'], ['antigo', 'Sim, mas faz mais de 2 anos'], ['nao', 'Não'], ['naosei', 'Não sei']]; } },
    { id: 'bolsaFamilia', tipo: 'opcoes', resumo: 'Recebe Bolsa Família',
      texto: function () { return 'A família já recebe o Bolsa Família?'; },
      opcoes: function () { return [['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei']]; } },
    { id: 'idade', tipo: 'opcoes', resumo: 'Pessoa com 60 anos ou mais',
      texto: function () { return 'Alguém na casa tem 60 anos ou mais?'; },
      opcoes: function () { return [['ninguem', 'Ninguém'], ['60a64', 'Sim, entre 60 e 64 anos'], ['65', 'Sim, 65 anos ou mais']]; } },
    { id: 'idosoRenda', tipo: 'opcoes', resumo: 'Renda da pessoa idosa até 2 salários mínimos',
      mostrar: function (r) { return r.idade !== 'ninguem'; },
      texto: function () { return 'Essa pessoa ganha até ' + moeda(estado.salarioMinimo.valor * 2) + ' por mês, que são dois salários mínimos?'; },
      opcoes: function () { return [['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei']]; } },
    { id: 'deficiencia', tipo: 'opcoes', resumo: 'Pessoa com deficiência', opcoes: simOuNao,
      texto: function () { return 'Alguém na casa tem deficiência ou uma condição de longo prazo que limita o dia a dia?'; } },
    { id: 'beneficioINSS', tipo: 'opcoes', resumo: 'Recebe benefício do INSS por idade ou deficiência', opcoes: simOuNao,
      texto: function () { return 'Alguém da casa já recebe do INSS um benefício de um salário mínimo por ser idoso ou ter deficiência?'; } },
    { id: 'estudante', tipo: 'opcoes', resumo: 'Estudante do ensino médio público', opcoes: simOuNao,
      texto: function () { return 'Alguém de 14 a 24 anos estuda no ensino médio em escola pública?'; } },
    { id: 'luz', tipo: 'opcoes', resumo: 'Conta de luz no nome de alguém da casa',
      texto: function () { return 'A conta de luz está no nome de alguém que mora na casa?'; },
      opcoes: function () { return [['sim', 'Sim'], ['nao', 'Não, está no nome de outra pessoa'], ['semconta', 'Não tenho conta de luz própria']]; } },
    { id: 'remedio', tipo: 'opcoes', resumo: 'Remédio de uso contínuo',
      texto: function () { return 'Alguém usa remédio todo dia para pressão alta, diabetes, asma, colesterol ou outra doença crônica?'; },
      opcoes: function () { return [['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei']]; } },
    { id: 'negocio', tipo: 'opcoes', resumo: 'Negócio próprio',
      texto: function () { return 'Por último: você tem um negócio próprio ou trabalha por conta?'; },
      opcoes: function () { return [['cnpj', 'Sim, com CNPJ (MEI ou microempresa)'], ['semcnpj', 'Sim, sem CNPJ'], ['quer', 'Não, mas quero começar'], ['nao', 'Não']]; } },
    { id: 'faturamento', tipo: 'opcoes', resumo: 'Faturamento até R$ 360 mil por ano',
      mostrar: function (r) { return r.negocio === 'cnpj' || r.negocio === 'semcnpj'; },
      texto: function () { return 'Nos últimos 12 meses, o negócio faturou até R$ 360 mil?'; },
      opcoes: function () { return [['sim', 'Sim'], ['nao', 'Não, mais que isso'], ['naosei', 'Não sei']]; } },
    { id: 'dividas', tipo: 'opcoes', resumo: 'Dívidas do negócio acima de R$ 80 mil',
      mostrar: function (r) { return r.negocio === 'cnpj' || r.negocio === 'semcnpj'; },
      texto: function () { return 'As dívidas do negócio com empréstimos passam de R$ 80 mil?'; },
      opcoes: function () { return [['nao', 'Não'], ['sim', 'Sim']]; } }
  ];

  /* ---------- Utilitários ---------- */
  function porId(id) { return document.getElementById(id); }

  /* Cria um elemento HTML com atributos e filhos. */
  function criar(tag, atributos, filhos) {
    var elemento = document.createElement(tag);
    Object.keys(atributos || {}).forEach(function (chave) {
      var valor = atributos[chave];
      if (valor === null || valor === undefined || valor === false) { return; }
      if (chave === 'texto') { elemento.textContent = valor; }
      else if (chave === 'classe') { elemento.className = valor; }
      else { elemento.setAttribute(chave, valor); }
    });
    (filhos || []).forEach(function (filho) {
      if (filho) { elemento.append(filho); }
    });
    return elemento;
  }

  /* Deixa só letras, espaços, hífen e apóstrofo. "Apolônio." vira "Apolônio". */
  function limparTexto(texto) {
    return texto.replace(/[^A-Za-zÀ-ÿ\s'-]/g, '').replace(/\s+/g, ' ').trim();
  }

  function lerNumero(texto) {
    var s = String(texto || '').trim().replace(/[R$\s]/g, '');
    if (s === '') { return null; }
    if (s.indexOf(',') > -1) { s = s.replace(/\./g, '').replace(',', '.'); }
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) { s = s.replace(/\./g, ''); }
    var n = Number(s);
    return isFinite(n) ? n : NaN;
  }

  function esperar(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }
  function visivel(p) { return !p.mostrar || p.mostrar(estado.respostas); }
  function respondida(p) { return Object.prototype.hasOwnProperty.call(estado.respostas, p.id); }

  function textoDaResposta(pergunta, valor) {
    if (pergunta.alternativa && valor === pergunta.alternativa[0]) { return pergunta.alternativa[1]; }
    if (pergunta.tipo === 'moeda') { return moeda(valor); }
    if (pergunta.tipo === 'opcoes') {
      var opcao = pergunta.opcoes(estado.respostas).filter(function (o) { return o[0] === valor; })[0];
      return opcao ? opcao[1] : String(valor);
    }
    return String(valor);
  }

  /* ---------- Mensagens ---------- */
  var mensagens, entrada;

  /* Rola a página para a última mensagem ficar visível acima da área de resposta,
     que fica presa no rodapé da tela. Mensagens altas aparecem a partir do começo. */
  function rolar(no) {
    var alvo = no || mensagens.lastElementChild;
    if (!alvo) { return; }
    var topoFixo = document.querySelector('.topo').offsetHeight;
    var areaVisivel = window.innerHeight - entrada.offsetHeight - topoFixo - 32;
    var caixa = alvo.getBoundingClientRect();
    var destino = caixa.height > areaVisivel
      ? window.scrollY + caixa.top - topoFixo - 16
      : window.scrollY + caixa.bottom - (window.innerHeight - entrada.offsetHeight - 16);
    window.scrollTo({ top: Math.max(0, destino), behavior: 'smooth' });
  }

  /* Mostra "digitando" por um instante e depois a mensagem do Xandinho. */
  function falar(conteudo, marca) {
    var digitando = criar('li', { classe: 'mensagem mensagem--xandinho', 'aria-hidden': 'true' }, [
      criar('img', { classe: 'mensagem__avatar', src: 'img/xandinho.svg', alt: '' }),
      criar('div', { classe: 'balao balao--digitando' }, [criar('span'), criar('span'), criar('span')])
    ]);
    mensagens.appendChild(digitando);
    rolar(digitando);
    return esperar(400).then(function () {
      digitando.remove();
      var balao = criar('div', { classe: 'balao' }, [typeof conteudo === 'string' ? criar('p', { texto: conteudo }) : conteudo]);
      var item = criar('li', { classe: 'mensagem mensagem--xandinho', 'data-marca': marca || null }, [
        criar('img', { classe: 'mensagem__avatar', src: 'img/xandinho.svg', alt: '' }),
        criar('div', null, [criar('span', { classe: 'visualmente-oculto', texto: 'Xandinho diz:' }), balao])
      ]);
      mensagens.appendChild(item);
      rolar(item);
    });
  }

  function mensagemDaPessoa(pergunta, texto) {
    var item = criar('li', { classe: 'mensagem mensagem--usuario' }, [
      criar('div', { classe: 'balao balao--usuario' }, [criar('span', { classe: 'visualmente-oculto', texto: 'Você respondeu:' }), criar('p', { texto: texto })]),
      criar('button', { type: 'button', classe: 'mensagem__alterar', 'data-alterar': pergunta.id, 'aria-label': 'Alterar a resposta: ' + pergunta.resumo, texto: 'Alterar' })
    ]);
    mensagens.appendChild(item);
    rolar(item);
  }

  function atualizarProgresso() {
    var visiveis = PERGUNTAS.filter(visivel);
    var feitas = visiveis.filter(respondida).length;
    porId('progresso').max = visiveis.length;
    porId('progresso').value = feitas;
    porId('progresso-texto').textContent = feitas < visiveis.length ? 'Pergunta ' + (feitas + 1) + ' de ' + visiveis.length : 'Perguntas concluídas';
  }

  /* ---------- Área de resposta ---------- */
  function limparEntrada() { entrada.textContent = ''; }

  function botao(texto, aoClicar, principal) {
    var b = criar('button', { type: 'button', classe: 'resposta' + (principal ? ' resposta--primaria' : ''), texto: texto });
    b.addEventListener('click', aoClicar);
    return b;
  }

  function montarEntrada(pergunta) {
    limparEntrada();
    if (pergunta.tipo === 'opcoes') {
      var grupo = criar('div', { classe: 'respostas', role: 'group', 'aria-label': pergunta.resumo });
      pergunta.opcoes(estado.respostas).forEach(function (o) {
        grupo.appendChild(botao(o[1], function () { responder(pergunta, o[0]); }));
      });
      entrada.appendChild(grupo);
      grupo.querySelector('button').focus({ preventScroll: true });
      rolar();
      return;
    }

    var idCampo = 'campo-' + pergunta.id;
    var erro = criar('p', { classe: 'campo__erro', id: 'erro-' + idCampo, 'aria-live': 'polite' });
    var numerico = pergunta.tipo === 'moeda' || pergunta.tipo === 'inteiro';
    var campo = criar('input', {
      type: 'text', id: idCampo, autocomplete: 'off',
      inputmode: pergunta.tipo === 'moeda' ? 'decimal' : (numerico ? 'numeric' : (pergunta.teclado || null)),
      placeholder: pergunta.exemplo || (pergunta.tipo === 'moeda' ? '0,00' : null),
      'aria-describedby': erro.id
    });
    var caixa = pergunta.tipo === 'moeda' ? criar('div', { classe: 'campo__moeda' }, [criar('span', { 'aria-hidden': 'true', texto: 'R$' }), campo]) : campo;
    var formulario = criar('form', { classe: 'conversa__form', novalidate: 'novalidate' }, [
      criar('label', { classe: 'visualmente-oculto', for: idCampo, texto: pergunta.resumo }),
      criar('div', { classe: 'conversa__linha' }, [caixa, criar('button', { type: 'submit', classe: 'botao botao--primario', texto: 'Enviar' })]),
      erro
    ]);

    formulario.addEventListener('submit', function (evento) {
      evento.preventDefault();
      var mensagem = '';
      var valor = pergunta.limpar ? limparTexto(campo.value) : campo.value.trim();
      if (numerico) {
        valor = lerNumero(campo.value);
        if (valor === null) { mensagem = 'Digite um número.'; }
        else if (isNaN(valor) || valor < 0) { mensagem = 'Use só números, como 1.500 ou 1500,50.'; }
        else if (pergunta.tipo === 'inteiro' && (Math.floor(valor) !== valor || valor < pergunta.minimo || valor > pergunta.maximo)) {
          mensagem = 'Digite um número inteiro entre ' + pergunta.minimo + ' e ' + pergunta.maximo + '.';
        }
      }
      if (!mensagem && pergunta.validar) { mensagem = pergunta.validar(valor, estado.respostas); }
      erro.textContent = mensagem;
      campo.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
      if (mensagem) { campo.focus(); return; }
      responder(pergunta, valor);
    });
    campo.addEventListener('input', function () { erro.textContent = ''; campo.setAttribute('aria-invalid', 'false'); });

    entrada.appendChild(formulario);
    if (pergunta.alternativa) {
      entrada.appendChild(criar('div', { classe: 'respostas' }, [botao(pergunta.alternativa[1], function () { responder(pergunta, pergunta.alternativa[0]); })]));
    }
    campo.focus({ preventScroll: true });
    rolar();
  }

  /* ---------- Fluxo da conversa ---------- */
  function responder(pergunta, valor) {
    if (estado.ocupado) { return; }
    estado.ocupado = true;
    estado.respostas[pergunta.id] = valor;
    limparEntrada();
    mensagemDaPessoa(pergunta, textoDaResposta(pergunta, valor));
    var proximoPasso = pergunta.depois ? pergunta.depois(valor, estado.respostas) : Promise.resolve();
    proximoPasso.then(function () { estado.ocupado = false; atualizarProgresso(); perguntar(); });
  }

  function perguntar() {
    var pergunta = PERGUNTAS.filter(function (p) { return visivel(p) && !respondida(p); })[0];
    if (!pergunta) { return conferir(); }
    estado.ocupado = true;
    falar(pergunta.texto(estado.respostas), pergunta.id).then(function () {
      estado.ocupado = false;
      montarEntrada(pergunta);
    });
  }

  function listaDoResumo() {
    var lista = criar('dl', { classe: 'resumo' });
    PERGUNTAS.filter(function (p) { return visivel(p) && respondida(p); }).forEach(function (p) {
      lista.appendChild(criar('div', null, [criar('dt', { texto: p.resumo }), criar('dd', { texto: textoDaResposta(p, estado.respostas[p.id]) })]));
    });
    return lista;
  }

  function conferir() {
    estado.ocupado = true;
    falar(criar('div', null, [criar('p', { texto: 'Deixa eu conferir se entendi tudo, ' + estado.respostas.nome + ':' }), listaDoResumo()]), 'conferir').then(function () {
      estado.ocupado = false;
      limparEntrada();
      var grupo = criar('div', { classe: 'respostas' }, [
        botao('Está certo, pode gerar o relatório', function () { limparEntrada(); gerarRelatorio(); }, true),
        botao('Quero corrigir algo', function () {
          limparEntrada();
          falar('É só tocar em "Alterar" na resposta que você quer mudar. Eu sigo dali.');
        })
      ]);
      entrada.appendChild(grupo);
      grupo.querySelector('button').focus({ preventScroll: true });
      rolar();
    });
  }

  /* Volta a conversa até a pergunta escolhida e apaga as respostas seguintes. */
  function alterar(idPergunta) {
    if (estado.ocupado) { return; }
    var ordem = PERGUNTAS.map(function (p) { return p.id; });
    ordem.slice(ordem.indexOf(idPergunta)).forEach(function (id) { delete estado.respostas[id]; });
    var alvo = mensagens.querySelector('[data-marca="' + idPergunta + '"]');
    while (alvo && alvo.nextSibling) { alvo.nextSibling.remove(); }
    if (alvo) { alvo.remove(); }
    porId('relatorio').hidden = true;
    limparEntrada();
    atualizarProgresso();
    perguntar();
  }

  /* ---------- Relatório ---------- */
  function contexto() {
    var r = estado.respostas;
    return {
      rendaPorPessoa: r.renda / r.pessoas,
      sm: estado.salarioMinimo.valor,
      cadastro: r.cadastro,
      bolsaFamilia: r.bolsaFamilia,
      pessoas: r.pessoas,
      idoso60: r.idade !== 'ninguem',
      idoso65: r.idade === '65',
      idosoRendaAte2SM: r.idosoRenda === 'sim' ? true : (r.idosoRenda === 'nao' ? false : null),
      deficiencia: r.deficiencia === 'sim',
      recebeBPC: r.beneficioINSS === 'sim',
      estudante: r.estudante === 'sim',
      contaLuzNoNome: r.luz,
      remedio: r.remedio,
      negocio: r.negocio,
      faturamentoAte360: r.faturamento === 'sim' ? true : (r.faturamento === 'nao' ? false : null),
      dividasAcima80: r.dividas === 'sim'
    };
  }

  var SITUACAO = { tem: 'Provável direito', pode: 'Falta um passo', conferir: 'Vale conferir', emdia: 'Já está em dia' };
  var ORDEM = { tem: 0, pode: 1, conferir: 2, emdia: 3 };
  var SELO = { tem: 'selo--sim', pode: 'selo--atencao', conferir: 'selo--info', emdia: 'selo--neutro' };

  function cartao(resultado) {
    var item = resultado.item;
    return criar('li', { classe: 'direito' }, [
      criar('div', { classe: 'direito__topo' }, [
        criar('h4', { classe: 'direito__nome', texto: item.nome }),
        criar('span', { classe: 'selo ' + SELO[resultado.situacao], texto: SITUACAO[resultado.situacao] })
      ]),
      criar('p', { texto: item.oQueE }),
      resultado.motivo ? criar('p', { classe: 'direito__motivo', texto: resultado.motivo }) : null,
      criar('p', null, [criar('strong', { texto: 'Como pedir: ' }), item.comoPedir]),
      item.documentos.length ? criar('p', null, [criar('strong', { texto: 'O que levar: ' }), item.documentos.join(', ') + '.']) : null,
      criar('p', null, [criar('strong', { texto: 'Onde: ' }), item.onde + '.']),
      linhaDeFontes(item.fontes)
    ]);
  }

  function linhaDeFontes(fontes) {
    var linha = criar('p', { classe: 'direito__fonte' }, [fontes.length > 1 ? 'Fontes: ' : 'Fonte: ']);
    fontes.forEach(function (fonte, i) {
      if (i > 0) { linha.append(' e '); }
      linha.append(criar('a', { href: fonte.url, target: '_blank', rel: 'noopener', texto: fonte.titulo }));
    });
    linha.append(', consultadas em novembro de 2026.');
    return linha;
  }

  function ordenar(lista) {
    return lista.slice().sort(function (a, b) { return ORDEM[a.situacao] - ORDEM[b.situacao]; });
  }

  /* Frase-resumo, como "2 prováveis direitos, 3 com um passo pendente e 1 já em dia." */
  function sintese(lista) {
    var nomes = {
      tem: ['provável direito', 'prováveis direitos'],
      pode: ['com um passo pendente', 'com um passo pendente'],
      conferir: ['para conferir', 'para conferir'],
      emdia: ['já em dia', 'já em dia']
    };
    var partes = ['tem', 'pode', 'conferir', 'emdia'].map(function (s) {
      var n = lista.filter(function (x) { return x.situacao === s; }).length;
      return n ? n + ' ' + nomes[s][n === 1 ? 0 : 1] : null;
    }).filter(Boolean);
    var ultima = partes.pop();
    return (partes.length ? partes.join(', ') + ' e ' : '') + ultima + '.';
  }

  function gerarRelatorio() {
    estado.ocupado = true;
    var r = estado.respostas;
    var ctx = contexto();
    var resultados = Xandinho.avaliarDireitos(ctx);
    var direitos = ordenar(resultados.filter(function (x) { return x.item.categoria === 'direito' && x.situacao !== 'nao'; }));
    var oportunidades = ordenar(resultados.filter(function (x) { return x.item.categoria === 'oportunidade' && x.situacao !== 'nao'; }));
    var foraDoPerfil = resultados.filter(function (x) { return x.situacao === 'nao'; });
    var dependemDoCadastro = direitos.filter(function (x) {
      return x.situacao === 'pode' && x.item.id !== 'cadastro-unico' && x.motivo && x.motivo.indexOf('Cadastro Único') > -1;
    }).length;

    var area = porId('relatorio-conteudo');
    area.textContent = '';
    var secoes = [
      criar('header', { classe: 'relatorio__cabecalho' }, [
        criar('img', { src: 'img/xandinho.svg', alt: '', width: '48', height: '48' }),
        criar('div', null, [
          criar('h2', { id: 'relatorio-titulo', tabindex: '-1', texto: 'Relatório de direitos de ' + r.nome }),
          criar('p', { classe: 'relatorio__data', texto: 'Gerado pelo Xandinho em ' + new Date().toLocaleDateString('pt-BR') + '.' })
        ])
      ]),
      dependemDoCadastro ? criar('div', { classe: 'relatorio__destaque' }, [
        criar('h3', { texto: 'Seu próximo passo mais importante' }),
        criar('p', { texto: (r.cadastro === 'antigo' ? 'Atualizar' : 'Fazer') + ' o Cadastro Único no CRAS da sua cidade. Isso destrava ' + dependemDoCadastro + ' dos direitos abaixo.' })
      ]) : null,
      criar('section', { classe: 'relatorio__bloco' }, [
        criar('h3', { texto: 'O que você informou' }),
        listaDoResumo(),
        criar('p', null, [criar('strong', { texto: 'Renda por pessoa: ' + moeda(ctx.rendaPorPessoa) + '. ' }), 'Salário mínimo usado: ' + moeda(ctx.sm) + ' (' + estado.salarioMinimo.fonte + ').'])
      ]),
      criar('section', { classe: 'relatorio__bloco' }, [
        criar('h3', { texto: direitos.length + (direitos.length === 1 ? ' orientação' : ' orientações') + ' para a sua família' }),
        direitos.length ? criar('p', { classe: 'relatorio__nota', texto: 'São ' + sintese(direitos) }) : null,
        direitos.length ? criar('ul', { classe: 'direitos' }, direitos.map(cartao))
          : criar('p', { texto: 'Pelas respostas, não encontrei programas do catálogo para a sua família agora. O CRAS da sua cidade pode indicar outros apoios.' })
      ]),
      oportunidades.length ? criar('section', { classe: 'relatorio__bloco' }, [
        criar('h3', { texto: 'Oportunidades para o seu negócio (' + oportunidades.length + ')' }),
        criar('p', { classe: 'relatorio__nota', texto: 'Oportunidades não são direitos garantidos: dependem de análise das instituições.' }),
        criar('ul', { classe: 'direitos' }, oportunidades.map(cartao))
      ]) : null,
      foraDoPerfil.length ? criar('section', { classe: 'relatorio__bloco' }, [
        criar('h3', { texto: 'Outros programas verificados' }),
        criar('p', { texto: 'Pelas suas respostas, estes não se aplicam agora: ' + foraDoPerfil.map(function (x) { return x.item.nome; }).join(', ') + '.' })
      ]) : null,
      criar('aside', { classe: 'relatorio__aviso' }, [
        criar('h3', { texto: 'Importante' }),
        criar('p', { texto: 'Este relatório é uma orientação gerada automaticamente a partir das informações que você forneceu e das regras públicas consultadas nas datas indicadas. Ele não garante o acesso a nenhum benefício e não substitui a análise dos órgãos responsáveis, que podem pedir documentos e aplicar outros critérios. As regras dos programas podem mudar. Confirme sempre nos canais oficiais ou no CRAS da sua cidade. Os responsáveis por esta ferramenta não se responsabilizam por decisões tomadas com base neste relatório nem pelo resultado de pedidos feitos aos órgãos.' })
      ])
    ];
    /* Seções opcionais ficam como null quando não se aplicam: só as existentes entram na página. */
    area.append.apply(area, secoes.filter(Boolean));
    porId('relatorio').hidden = false;

    falar('Pronto, ' + r.nome + '! Preparei ' + direitos.length + (direitos.length === 1 ? ' orientação' : ' orientações') +
      ' para a sua família. O relatório está logo abaixo.', 'resultado').then(function () {
      estado.ocupado = false;
      limparEntrada();
      entrada.appendChild(criar('div', { classe: 'respostas' }, [
        botao('Imprimir ou salvar em PDF', function () { window.print(); }, true),
        criar('a', { classe: 'resposta', href: 'https://wa.me/?text=' + encodeURIComponent(textoParaWhatsApp(resultados, ctx)), target: '_blank', rel: 'noopener', texto: 'Enviar pelo WhatsApp' }),
        botao('Recomeçar', iniciar)
      ]));
      porId('relatorio-titulo').focus({ preventScroll: true });
      porId('relatorio').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function textoParaWhatsApp(resultados, ctx) {
    return ['Relatório do Xandinho (' + new Date().toLocaleDateString('pt-BR') + ')', 'Renda por pessoa: ' + moeda(ctx.rendaPorPessoa)]
      .concat(resultados.filter(function (x) { return x.situacao !== 'nao'; }).map(function (x) { return '- ' + x.item.nome + ': ' + SITUACAO[x.situacao].toLowerCase(); }))
      .concat(['Orientação automática. Confirme nos canais oficiais ou no CRAS.']).join('\n');
  }

  /* ---------- Início ---------- */
  function iniciar() {
    estado.respostas = {};
    estado.ocupado = false;
    mensagens.textContent = '';
    porId('relatorio').hidden = true;
    atualizarProgresso();
    falar('Oi! Eu sou o Xandinho. Em poucos minutos, descubro quais programas sociais podem atender a sua família e preparo um relatório com o que fazer em cada caso. Nada do que você digitar sai do seu navegador.', 'inicio')
      .then(function () {
        limparEntrada();
        entrada.appendChild(criar('div', { classe: 'respostas' }, [botao('Vamos começar', function () { limparEntrada(); perguntar(); }, true)]));
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    mensagens = porId('mensagens');
    entrada = porId('entrada');
    mensagens.addEventListener('click', function (evento) {
      var botaoAlterar = evento.target.closest('[data-alterar]');
      if (botaoAlterar) { alterar(botaoAlterar.dataset.alterar); }
    });
    porId('recomecar').addEventListener('click', iniciar);
    Xandinho.buscarSalarioMinimo().then(function (sm) { estado.salarioMinimo = sm; });
    iniciar();
  });
})(window.Xandinho);
