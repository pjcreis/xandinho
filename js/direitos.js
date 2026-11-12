/* Catálogo de direitos e oportunidades que o Xandinho verifica (13 registros).
   
   Cada item tem uma função avaliar(ctx) que devolve:
   - 'tem'  : pelas respostas, a família provavelmente tem direito
   - 'pode' : pode ter direito, mas falta um passo (por exemplo, o Cadastro Único)
   - 'nao'  : pelas respostas, não se encaixa agora

   ctx traz as respostas já tratadas:
   rendaPorPessoa, sm (salário mínimo), cadastro ('atualizado' | 'antigo' | 'nao' | 'naosei'),
   pessoas, idoso60, idoso65, idosoRendaAte2SM, deficiencia, recebeBPC,
   estudante, contaLuzNoNome, remedio, negocio, faturamentoAte360, dividasAcima80. */
window.Xandinho = window.Xandinho || {};

(function (Xandinho) {
  'use strict';

  function dependeDoCadastro(ctx, mensagemSeTiver) {
    if (ctx.cadastro === 'atualizado') {
      return { situacao: 'tem', motivo: mensagemSeTiver || null };
    }
    var motivo = ctx.cadastro === 'antigo'
      ? 'O Cadastro Único da família precisa ser atualizado (ele vale por 2 anos).'
      : 'A família precisa estar no Cadastro Único.';
    return { situacao: 'pode', motivo: motivo };
  }

  var nao = { situacao: 'nao', motivo: null };

  Xandinho.direitos = [
    {
      id: 'cadastro-unico',
      categoria: 'direito',
      nome: 'Cadastro Único',
      oQueE: 'É a porta de entrada para quase todos os programas sociais do governo.',
      comoPedir: 'Procure o CRAS da sua cidade para fazer ou atualizar o cadastro. Atualize a cada 2 anos ou sempre que mudar a renda, o endereço ou quem mora na casa.',
      documentos: ['CPF ou título de eleitor do responsável pela família', 'Documento de todas as pessoas da casa', 'Comprovante de residência'],
      onde: 'CRAS da sua cidade (a prefeitura informa o endereço)',
      fonte: { titulo: 'Ministério do Desenvolvimento e Assistência Social', url: 'https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia/informes/informe-bolsa-familia-112' },
      consultadoEm: '11/2026',
      avaliar: function (ctx) {
        if (ctx.rendaPorPessoa > ctx.sm / 2) { return nao; }
        if (ctx.cadastro === 'atualizado') { return { situacao: 'tem', motivo: 'O cadastro está em dia. Mantenha atualizado.' }; }
        return { situacao: 'pode', motivo: ctx.cadastro === 'antigo' ? 'O cadastro precisa ser atualizado.' : 'A família ainda precisa se cadastrar.' };
      }
    },
    {
      id: 'tarifa-social-energia',
      categoria: 'direito',
      nome: 'Conta de luz gratuita (Tarifa Social)',
      oQueE: 'Conta de luz sem cobrança de energia até 80 kWh por mês.',
      comoPedir: 'É automática para quem tem o Cadastro Único em dia. A conta de luz precisa estar no nome de alguém da família cadastrada, e a cidade da conta precisa ser a mesma do cadastro.',
      documentos: [],
      onde: 'Automático na conta de luz. Dúvidas: atendimento da distribuidora de energia',
      fonte: { titulo: 'Lei 15.235/2025 (Conjur)', url: 'https://www.conjur.com.br/?p=865386' },
      consultadoEm: '11/2026',
      avaliar: function (ctx) {
        if (!(ctx.rendaPorPessoa <= ctx.sm / 2 || ctx.recebeBPC)) { return nao; }
        var r = dependeDoCadastro(ctx);
        if (ctx.contaLuzNoNome !== 'sim') {
          r.motivo = (r.motivo ? r.motivo + ' ' : '') + 'A conta de luz precisa estar no nome de alguém que mora na casa.';
          r.situacao = 'pode';
        }
        return r;
      }
    },
    {
      id: 'desconto-social-energia',
      categoria: 'direito',
      nome: 'Desconto na conta de luz',
      oQueE: 'Desconto na conta de luz para consumo de até 120 kWh por mês.',
      comoPedir: 'É automático para quem tem o Cadastro Único em dia e renda entre meio e um salário mínimo por pessoa.',
      documentos: [],
      onde: 'Automático na conta de luz',
      fonte: { titulo: 'IstoÉ Dinheiro: Desconto social na conta de luz', url: 'https://istoedinheiro.com.br/desconto-social-na-conta-de-luz-veja-quem-tem-direito' },
      consultadoEm: '11/2026',
      avaliar: function (ctx) {
        if (ctx.recebeBPC || ctx.rendaPorPessoa <= ctx.sm / 2 || ctx.rendaPorPessoa > ctx.sm) { return nao; }
        return dependeDoCadastro(ctx);
      }
    },
    {
      id: 'tarifa-social-agua',
      categoria: 'direito',
      nome: 'Desconto na conta de água (Tarifa Social)',
      oQueE: 'Desconto na conta de água. No Espírito Santo, até 75% para renda de até R$ 218 por pessoa e até 60% para renda até meio salário mínimo por pessoa.',
      comoPedir: 'Se o desconto não aparecer na conta, procure o atendimento da Cesan, ou o serviço de água da sua cidade, com os documentos abaixo.',
      documentos: ['Matrícula do imóvel na conta de água', 'Comprovante de residência', 'Documentos pessoais', 'Comprovante de inscrição no Cadastro Único'],
      onde: 'Atendimento da Cesan ou do serviço de água da sua cidade',
      fonte: { titulo: 'Tribuna Online: lei dá direito a redução na conta de água para 260 mil famílias do ES', url: 'https://tribunaonline.com.br/economia/lei-da-direito-a-reducao-na-conta-de-agua-para-260-mil-familias-do-es-286834' },
      consultadoEm: '11/2026',
      avaliar: function (ctx) {
        if (!(ctx.rendaPorPessoa <= ctx.sm / 2 || ctx.recebeBPC)) { return nao; }
        return dependeDoCadastro(ctx, ctx.rendaPorPessoa <= 218 ? 'Pela renda informada, a faixa é de até 75% de desconto.' : 'Pela renda informada, a faixa é de até 60% de desconto.');
      }
    },
    {
      id: 'gas-do-povo',
      categoria: 'direito',
      nome: 'Gás de cozinha gratuito (Gás do Povo)',
      oQueE: 'Recarga gratuita do botijão de 13 kg, de 4 a 6 vezes por ano, conforme o tamanho da família.',
      comoPedir: 'Não há inscrição própria: a seleção usa o Cadastro Único. Consulte se foi selecionado no aplicativo Meu Social ou no telefone da Caixa (0800 726 0207).',
      documentos: ['Cartão do Bolsa Família ou cartão de débito da Caixa, na hora da retirada', 'Um botijão vazio'],
      onde: 'Revendas de gás credenciadas',
      fonte: { titulo: 'Correio 24 Horas: Gás do Povo, regras e retirada', url: 'https://www.correio24horas.com.br/economia/gas-do-povo-libera-novos-vales-no-dia-10-mas-quem-nao-fizer-a-troca-a-tempo-perde-a-recarga-1126' },
      consultadoEm: '11/2026',
      avaliar: function (ctx) {
        if (ctx.rendaPorPessoa > ctx.sm / 2 || ctx.pessoas < 2) { return nao; }
        var r = dependeDoCadastro(ctx);
        r.situacao = 'pode';
        r.motivo = (r.motivo ? r.motivo + ' ' : '') + 'A seleção não é automática: famílias do Bolsa Família têm prioridade.';
        return r;
      }
    },
    {
      id: 'bolsa-familia',
      categoria: 'direito',
      nome: 'Bolsa Família',
      oQueE: 'Transferência de renda mensal para famílias de baixa renda.',
      comoPedir: 'A família precisa estar no Cadastro Único. A seleção é feita pelo governo a partir do cadastro, e é preciso cumprir compromissos de saúde e educação.',
      documentos: ['Os mesmos do Cadastro Único'],
      onde: 'CRAS da sua cidade',
      fonte: { titulo: 'Ministério do Desenvolvimento e Assistência Social', url: 'https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia/informes/informe-bolsa-familia-112' },
      consultadoEm: '11/2026',
      avaliar: function (ctx) {
        if (ctx.rendaPorPessoa > 218) { return nao; }
        return dependeDoCadastro(ctx);
      }
    },
    {
      id: 'bpc-idoso',
      categoria: 'direito',
      nome: 'Benefício para pessoa idosa (BPC)',
      oQueE: 'Um salário mínimo por mês para pessoas com 65 anos ou mais, de baixa renda, mesmo sem ter contribuído para o INSS.',
      comoPedir: 'Peça pelo Meu INSS (site ou aplicativo) ou pelo telefone 135. A família precisa estar no Cadastro Único.',
      documentos: ['Documento com foto e CPF da pessoa idosa', 'Cadastro Único atualizado'],
      onde: 'Meu INSS ou telefone 135',
      fonte: { titulo: 'A Tarde: BPC em 2026', url: 'https://atarde.com.br/economia/bpc-mudou-com-o-salario-minimo-veja-quem-pode-receber-r-1621-em-2026-1403613' },
      consultadoEm: '11/2026',
      avaliar: function (ctx) {
        if (!ctx.idoso65 || ctx.recebeBPC || ctx.rendaPorPessoa > ctx.sm / 4) { return nao; }
        return dependeDoCadastro(ctx, 'O pedido passa por análise do INSS.');
      }
    },
    {
      id: 'bpc-deficiencia',
      categoria: 'direito',
      nome: 'Benefício para pessoa com deficiência (BPC)',
      oQueE: 'Um salário mínimo por mês para pessoa com deficiência de longo prazo, de qualquer idade, de baixa renda.',
      comoPedir: 'Peça pelo Meu INSS ou pelo telefone 135. Há avaliação médica e social. A família precisa estar no Cadastro Único.',
      documentos: ['Documento com foto e CPF', 'Laudos e exames médicos', 'Cadastro Único atualizado'],
      onde: 'Meu INSS ou telefone 135',
      fonte: { titulo: 'A Tarde: BPC em 2026', url: 'https://atarde.com.br/economia/bpc-mudou-com-o-salario-minimo-veja-quem-pode-receber-r-1621-em-2026-1403613' },
      consultadoEm: '11/2026',
      avaliar: function (ctx) {
        if (!ctx.deficiencia || ctx.recebeBPC || ctx.rendaPorPessoa > ctx.sm / 4) { return nao; }
        var r = dependeDoCadastro(ctx);
        r.situacao = 'pode';
        r.motivo = (r.motivo ? r.motivo + ' ' : '') + 'O direito depende da avaliação médica e social do INSS.';
        return r;
      }
    },
    {
      id: 'pe-de-meia',
      categoria: 'direito',
      nome: 'Poupança do ensino médio (Pé-de-Meia)',
      oQueE: 'Poupança para estudantes do ensino médio público, que pode somar até R$ 9.200 até a formatura.',
      comoPedir: 'É automático para estudantes de 14 a 24 anos do ensino médio público com família no Cadastro Único. É preciso ter frequência de pelo menos 80% nas aulas. Consulte no aplicativo Caixa Tem.',
      documentos: ['CPF do estudante regular', 'Dados da matrícula iguais aos do Cadastro Único'],
      onde: 'Escola e aplicativo Caixa Tem',
      fonte: { titulo: 'Seu Dinheiro: Pé-de-Meia, quem tem direito', url: 'https://www.seudinheiro.com/2026/economia/pe-de-meia-pago-hoje-data-de-agosto-isca/' },
      consultadoEm: '11/2026',
      avaliar: function (ctx) {
        if (!ctx.estudante || ctx.rendaPorPessoa > ctx.sm / 2) { return nao; }
        return dependeDoCadastro(ctx);
      }
    },
    {
      id: 'carteira-pessoa-idosa',
      categoria: 'direito',
      nome: 'Passagem gratuita para pessoa idosa',
      oQueE: 'Garante duas vagas gratuitas por ônibus interestadual ou, se estiverem ocupadas, pelo menos 50% de desconto na passagem.',
      comoPedir: 'Peça a Carteira da Pessoa Idosa pela internet, com a conta gov.br, ou no CRAS. Vale por 2 anos.',
      documentos: ['Conta gov.br ou documento com foto', 'Cadastro Único atualizado'],
      onde: 'Site da Carteira da Pessoa Idosa (gov.br) ou CRAS',
      fonte: { titulo: 'Sampi: Carteira da Pessoa Idosa', url: 'https://sampi.net.br/nacional/noticias/3004618/brasil-e-mundo/2026/09/tem-60-anos-veja-como-e-se-pode-solicitar-a-carteira-do-idoso' },
      consultadoEm: '11/2026',
      avaliar: function (ctx) {
        if (!ctx.idoso60 || ctx.idosoRendaAte2SM === false) { return nao; }
        var r = dependeDoCadastro(ctx);
        if (ctx.idosoRendaAte2SM === null) {
          r.situacao = 'pode';
          r.motivo = (r.motivo ? r.motivo + ' ' : '') + 'A renda da pessoa idosa precisa ser de até 2 salários mínimos.';
        }
        return r;
      }
    },
    {
      id: 'farmacia-popular',
      categoria: 'direito',
      nome: 'Remédios gratuitos (Farmácia Popular)',
      oQueE: 'Remédios gratuitos para pressão alta, diabetes, asma, colesterol e outras doenças, além de anticoncepcionais e fraldas geriátricas.',
      comoPedir: 'Vale para qualquer pessoa, sem limite de renda. Leve a receita a uma farmácia com o selo "Aqui Tem Farmácia Popular".',
      documentos: ['Receita médica válida, do SUS ou particular', 'Documento com foto e CPF'],
      onde: 'Farmácias com o selo "Aqui Tem Farmácia Popular"',
      fonte: { titulo: 'Estado de Minas: Farmácia Popular em 2026', url: 'https://www.em.com.br/emfoco/2026/08/04/farmacia-popular-entrega-41-medicamentos-e-itens-de-graca-para-toda-a-populacao-veja-o-que-levar/' },
      consultadoEm: '11/2026',
      avaliar: function (ctx) {
        if (ctx.remedio === 'sim') { return { situacao: 'tem', motivo: 'Confira se o seu remédio está na lista do programa.' }; }
        if (ctx.remedio === 'naosei') { return { situacao: 'pode', motivo: 'Vale para quem usa remédio contínuo da lista do programa.' }; }
        return nao;
      }
    },
    {
      id: 'microcredito-orientado',
      categoria: 'oportunidade',
      nome: 'Microcrédito produtivo orientado',
      oQueE: 'Crédito para o negócio com juros menores que os do cartão e orientação de um agente de crédito. Vai até R$ 21 mil por instituição.',
      comoPedir: 'Procure um agente de crédito. No ES, há o Nossocrédito (prefeituras e Banestes), as cooperativas Sicoob e, no norte do estado, o Crediamigo. A aprovação depende de análise da instituição.',
      documentos: ['Documento com foto e CPF', 'Comprovante de residência', 'Certificado do MEI, se tiver', 'Extrato ou anotações das vendas'],
      onde: 'Agente de crédito do Nossocrédito na prefeitura, Sicoob ou Banco do Nordeste',
      fonte: { titulo: 'Resolução CMN 4.854/2020', url: 'https://www.legisweb.com.br/legislacao/?id=401868' },
      consultadoEm: '11/2026',
      avaliar: function (ctx) {
        if (ctx.negocio !== 'cnpj' && ctx.negocio !== 'semcnpj') { return nao; }
        if (ctx.faturamentoAte360 === false || ctx.dividasAcima80) { return nao; }
        return { situacao: 'pode', motivo: 'Depende de análise e aprovação da instituição.' };
      }
    },
    {
      id: 'cursos-sebrae',
      categoria: 'oportunidade',
      nome: 'Cursos do Sebrae',
      oQueE: 'Cursos gratuitos de gestão, finanças, vendas e formalização, online e presenciais.',
      comoPedir: 'Acesse o site do Sebrae ou procure uma unidade do Sebrae ES.',
      documentos: [],
      onde: 'Site do Sebrae ou unidades do Sebrae ES',
      fonte: { titulo: 'Sebrae', url: 'https://sebrae.com.br' },
      consultadoEm: '11/2026',
      avaliar: function (ctx) {
        return ctx.negocio === 'nao' ? nao : { situacao: 'tem', motivo: null };
      }
    }
  ];

  Xandinho.avaliarDireitos = function (ctx) {
    return Xandinho.direitos.map(function (item) {
      var r = item.avaliar(ctx);
      return { item: item, situacao: r.situacao, motivo: r.motivo };
    });
  };
})(window.Xandinho);
