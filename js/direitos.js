/* Catálogo de direitos e oportunidades que o Xandinho verifica (13 registros).
   Regras consultadas em novembro de 2026, sempre que possível em páginas oficiais.

   Cada item tem uma função avaliar(ctx) que devolve uma situação:
   - 'tem'      : provável direito
   - 'pode'     : falta um passo (por exemplo, fazer ou atualizar o Cadastro Único)
   - 'conferir' : vale conferir, porque depende de seleção, avaliação ou de uma resposta "não sei"
   - 'emdia'    : a família já tem ou já está em dia
   - 'nao'      : pelas respostas, não se aplica agora

   ctx traz as respostas já tratadas:
   rendaPorPessoa, sm (salário mínimo), cadastro ('atualizado' | 'antigo' | 'nao' | 'naosei'),
   bolsaFamilia ('sim' | 'nao' | 'naosei'), pessoas, idoso60, idoso65, idosoRendaAte2SM,
   deficiencia, recebeBPC, estudante, contaLuzNoNome, remedio, negocio,
   faturamentoAte360, dividasAcima80. */
window.Xandinho = window.Xandinho || {};

(function (Xandinho) {
  'use strict';

  var NAO = { situacao: 'nao', motivo: null };

  /* Quase tudo depende do Cadastro Único atualizado. */
  function dependeDoCadastro(ctx, seEstiverEmDia) {
    if (ctx.cadastro === 'atualizado') {
      return seEstiverEmDia || { situacao: 'tem', motivo: null };
    }
    return {
      situacao: 'pode',
      motivo: ctx.cadastro === 'antigo'
        ? 'O Cadastro Único da família precisa ser atualizado (ele vale por 2 anos).'
        : 'A família precisa estar no Cadastro Único.'
    };
  }

  Xandinho.direitos = [
    {
      id: 'cadastro-unico',
      categoria: 'direito',
      nome: 'Cadastro Único',
      oQueE: 'É a porta de entrada para quase todos os programas sociais do governo.',
      comoPedir: 'Procure o CRAS da sua cidade para fazer ou atualizar o cadastro. Atualize a cada 2 anos ou sempre que mudar a renda, o endereço ou quem mora na casa.',
      documentos: ['CPF ou título de eleitor do responsável pela família', 'Documento de todas as pessoas da casa', 'Comprovante de residência'],
      onde: 'CRAS da sua cidade (a prefeitura informa o endereço)',
      fontes: [{ titulo: 'Ministério do Desenvolvimento e Assistência Social', url: 'https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia/informes/informe-bolsa-familia-112' }],
      avaliar: function (ctx) {
        if (ctx.rendaPorPessoa > ctx.sm / 2) { return NAO; }
        if (ctx.cadastro === 'atualizado') { return { situacao: 'emdia', motivo: 'O cadastro está em dia. Atualize sempre que algo mudar.' }; }
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
      fontes: [{ titulo: 'Lei 15.235/2025 (Planalto)', url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15235.htm' }],
      avaliar: function (ctx) {
        if (!(ctx.rendaPorPessoa <= ctx.sm / 2 || ctx.recebeBPC)) { return NAO; }
        var r = dependeDoCadastro(ctx);
        if (ctx.contaLuzNoNome !== 'sim') {
          r = { situacao: 'pode', motivo: (r.motivo ? r.motivo + ' ' : '') + 'A conta de luz precisa estar no nome de alguém que mora na casa.' };
        }
        return r;
      }
    },
    {
      id: 'desconto-social-energia',
      categoria: 'direito',
      nome: 'Desconto na conta de luz',
      oQueE: 'Desconto na conta de luz para consumo de até 120 kWh por mês, para renda entre meio e um salário mínimo por pessoa.',
      comoPedir: 'É automático para quem tem o Cadastro Único em dia.',
      documentos: [],
      onde: 'Automático na conta de luz',
      fontes: [{ titulo: 'Lei 15.235/2025 (Planalto)', url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15235.htm' }],
      avaliar: function (ctx) {
        if (ctx.recebeBPC || ctx.rendaPorPessoa <= ctx.sm / 2 || ctx.rendaPorPessoa > ctx.sm) { return NAO; }
        return dependeDoCadastro(ctx);
      }
    },
    {
      id: 'tarifa-social-agua',
      categoria: 'direito',
      nome: 'Desconto na conta de água (Tarifa Social)',
      oQueE: 'Desconto na conta de água e esgoto. No Espírito Santo, até 75% para renda de até R$ 218 por pessoa e até 60% para renda até meio salário mínimo por pessoa.',
      comoPedir: 'Se o desconto não aparecer na conta, procure o atendimento da Cesan, ou o serviço de água da sua cidade, com os documentos abaixo.',
      documentos: ['Matrícula do imóvel na conta de água', 'Comprovante de residência', 'Documentos pessoais', 'Comprovante de inscrição no Cadastro Único'],
      onde: 'Atendimento da Cesan ou do serviço de água da sua cidade',
      fontes: [
        { titulo: 'Lei 14.898/2024 (Planalto)', url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/L14898.htm' },
        { titulo: 'Faixas do ES: Tribuna Online, com dados da Arsp', url: 'https://tribunaonline.com.br/economia/lei-da-direito-a-reducao-na-conta-de-agua-para-260-mil-familias-do-es-286834' }
      ],
      avaliar: function (ctx) {
        if (!(ctx.rendaPorPessoa <= ctx.sm / 2 || ctx.recebeBPC)) { return NAO; }
        return dependeDoCadastro(ctx, {
          situacao: 'tem',
          motivo: ctx.rendaPorPessoa <= 218 ? 'Pela renda informada, a faixa é de até 75% de desconto.' : 'Pela renda informada, a faixa é de até 60% de desconto.'
        });
      }
    },
    {
      id: 'gas-do-povo',
      categoria: 'direito',
      nome: 'Gás de cozinha gratuito (Gás do Povo)',
      oQueE: 'Recarga gratuita do botijão de 13 kg para famílias do Bolsa Família com pelo menos duas pessoas.',
      comoPedir: 'Não há inscrição própria: a seleção é feita pelo governo, todo mês. Consulte pelo CPF do responsável familiar no aplicativo Meu Social, na página do programa ou no telefone da Caixa (0800 726 0207).',
      documentos: ['Cartão do Bolsa Família com chip ou código enviado ao celular, na hora da retirada', 'Um botijão vazio'],
      onde: 'Revendas de gás credenciadas no programa',
      fontes: [{ titulo: 'Programa Gás do Povo (gov.br)', url: 'https://www.gov.br/pt-br/servicos/programa-gas-do-povo' }],
      avaliar: function (ctx) {
        if (ctx.pessoas < 2 || ctx.rendaPorPessoa > ctx.sm / 2) { return NAO; }
        if (ctx.bolsaFamilia === 'sim') {
          if (ctx.cadastro !== 'atualizado') { return dependeDoCadastro(ctx); }
          return { situacao: 'conferir', motivo: 'A seleção é feita todo mês pelo governo. Consulte se a família foi selecionada.' };
        }
        if (ctx.bolsaFamilia === 'naosei') { return { situacao: 'conferir', motivo: 'É só para famílias que recebem o Bolsa Família.' }; }
        if (ctx.rendaPorPessoa <= 218) { return { situacao: 'pode', motivo: 'Primeiro, a família precisa entrar no Bolsa Família.' }; }
        return NAO;
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
      fontes: [{ titulo: 'Ministério do Desenvolvimento e Assistência Social', url: 'https://www.gov.br/mds/pt-br/acoes-e-programas/bolsa-familia/informes/informe-bolsa-familia-112' }],
      avaliar: function (ctx) {
        if (ctx.bolsaFamilia === 'sim') { return { situacao: 'emdia', motivo: 'A família já recebe. Mantenha o Cadastro Único atualizado para não perder.' }; }
        if (ctx.rendaPorPessoa > 218) { return NAO; }
        return dependeDoCadastro(ctx);
      }
    },
    {
      id: 'bpc-idoso',
      categoria: 'direito',
      nome: 'Benefício para pessoa idosa (BPC)',
      oQueE: 'Um salário mínimo por mês para pessoas com 65 anos ou mais, de baixa renda, mesmo sem ter contribuído para o INSS.',
      comoPedir: 'Peça pelo Meu INSS (site ou aplicativo) ou pelo telefone 135. A família precisa estar no Cadastro Único. O pedido passa por análise do INSS.',
      documentos: ['Documento com foto e CPF da pessoa idosa', 'Cadastro Único atualizado'],
      onde: 'Meu INSS ou telefone 135',
      fontes: [{ titulo: 'Solicitar Benefício Assistencial ao Idoso (gov.br)', url: 'https://www.gov.br/pt-br/servicos/solicitar-beneficio-assistencial-ao-idoso' }],
      avaliar: function (ctx) {
        if (!ctx.idoso65 || ctx.recebeBPC || ctx.rendaPorPessoa > ctx.sm / 4) { return NAO; }
        return dependeDoCadastro(ctx);
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
      fontes: [{ titulo: 'Solicitar Benefício Assistencial à Pessoa com Deficiência (gov.br)', url: 'https://www.gov.br/pt-br/servicos/solicitar-beneficio-assistencial-a-pessoa-com-deficiencia' }],
      avaliar: function (ctx) {
        if (!ctx.deficiencia || ctx.recebeBPC || ctx.rendaPorPessoa > ctx.sm / 4) { return NAO; }
        return dependeDoCadastro(ctx, { situacao: 'conferir', motivo: 'O direito depende da avaliação médica e social do INSS.' });
      }
    },
    {
      id: 'pe-de-meia',
      categoria: 'direito',
      nome: 'Poupança do ensino médio (Pé-de-Meia)',
      oQueE: 'Poupança para estudantes do ensino médio público, que pode somar até R$ 9.200 até a formatura.',
      comoPedir: 'É automático para estudantes de 14 a 24 anos do ensino médio público com família no Cadastro Único. É preciso ter frequência de pelo menos 80% nas aulas. O estudante consulta a situação na página do programa, com a conta gov.br.',
      documentos: ['CPF do estudante regular', 'Dados da matrícula iguais aos do Cadastro Único'],
      onde: 'Escola e página do Pé-de-Meia no MEC',
      fontes: [{ titulo: 'Pé-de-Meia (Ministério da Educação)', url: 'https://www.gov.br/mec/pt-br/pe-de-meia' }],
      avaliar: function (ctx) {
        if (!ctx.estudante || ctx.rendaPorPessoa > ctx.sm / 2) { return NAO; }
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
      onde: 'Site da Carteira da Pessoa Idosa ou CRAS',
      fontes: [{ titulo: 'Emitir Carteira da Pessoa Idosa (gov.br)', url: 'https://www.gov.br/pt-br/servicos/adquirir-carteira-do-idoso' }],
      avaliar: function (ctx) {
        if (!ctx.idoso60 || ctx.idosoRendaAte2SM === false) { return NAO; }
        if (ctx.idosoRendaAte2SM === null) {
          return dependeDoCadastro(ctx, { situacao: 'conferir', motivo: 'A renda da pessoa idosa precisa ser de até 2 salários mínimos.' });
        }
        return dependeDoCadastro(ctx);
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
      fontes: [{ titulo: 'Farmácia Popular (Ministério da Saúde)', url: 'https://www.gov.br/saude/pt-br/composicao/sectics/farmacia-popular' }],
      avaliar: function (ctx) {
        if (ctx.remedio === 'sim') { return { situacao: 'tem', motivo: 'Confira se o seu remédio está na lista do programa.' }; }
        if (ctx.remedio === 'naosei') { return { situacao: 'conferir', motivo: 'Vale para quem usa remédio contínuo da lista do programa.' }; }
        return NAO;
      }
    },
    {
      id: 'microcredito-orientado',
      categoria: 'oportunidade',
      nome: 'Microcrédito produtivo orientado',
      oQueE: 'Crédito para o negócio com juros menores que os do cartão e orientação de um agente de crédito. Vai até R$ 21 mil por instituição.',
      comoPedir: 'Procure um agente de crédito. No ES, há o Nossocrédito (prefeituras e Banestes), as cooperativas Sicoob e, no norte do estado, o Crediamigo.',
      documentos: ['Documento com foto e CPF', 'Comprovante de residência', 'Certificado do MEI, se tiver', 'Extrato ou anotações das vendas'],
      onde: 'Agente de crédito do Nossocrédito na prefeitura, Sicoob ou Banco do Nordeste',
      fontes: [{ titulo: 'Texto da Resolução CMN 4.854/2020 (LegisWeb)', url: 'https://www.legisweb.com.br/legislacao/?id=401868' }],
      avaliar: function (ctx) {
        if (ctx.negocio !== 'cnpj' && ctx.negocio !== 'semcnpj') { return NAO; }
        if (ctx.faturamentoAte360 === false || ctx.dividasAcima80) { return NAO; }
        return { situacao: 'conferir', motivo: 'Depende de análise e aprovação da instituição.' };
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
      fontes: [{ titulo: 'Sebrae', url: 'https://sebrae.com.br' }],
      avaliar: function (ctx) {
        return ctx.negocio === 'nao' ? NAO : { situacao: 'tem', motivo: null };
      }
    }
  ];

  /* Avalia todo o catálogo e devolve cada item com a sua situação. */
  Xandinho.avaliarDireitos = function (ctx) {
    return Xandinho.direitos.map(function (item) {
      var r = item.avaliar(ctx);
      return { item: item, situacao: r.situacao, motivo: r.motivo };
    });
  };
})(window.Xandinho);
