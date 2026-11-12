/* Consultas a serviços públicos, sem chave. Se a consulta falhar, o site segue funcionando. */
window.Xandinho = window.Xandinho || {};

(function (Xandinho) {
  'use strict';

  /* Valor usado se o Banco Central não responder. */
  Xandinho.SALARIO_MINIMO_PADRAO = { valor: 1621, fonte: 'valor de 2026 guardado no site' };

  function buscar(endereco) {
    var controle = new AbortController();
    var relogio = setTimeout(function () { controle.abort(); }, 8000);
    return fetch(endereco, { signal: controle.signal })
      .then(function (resposta) {
        if (!resposta.ok) { throw new Error('Falha na consulta'); }
        return resposta.json();
      })
      .finally(function () { clearTimeout(relogio); });
  }

  /* Salário mínimo pelo Banco Central (série 1619). */
  Xandinho.buscarSalarioMinimo = function () {
    return buscar('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1619/dados/ultimos/1?formato=json')
      .then(function (dados) {
        var valor = parseFloat(String(dados[dados.length - 1].valor).replace(',', '.'));
        if (!(valor > 1000 && valor < 5000)) { throw new Error('Valor fora do esperado'); }
        return { valor: valor, fonte: 'Banco Central' };
      })
      .catch(function () { return Xandinho.SALARIO_MINIMO_PADRAO; });
  };

  /* Cidade a partir do CEP, pela ViaCEP. */
  Xandinho.buscarCidade = function (cep) {
    return buscar('https://viacep.com.br/ws/' + cep + '/json/').then(function (d) {
      if (d.erro || !d.localidade) { throw new Error('CEP não encontrado'); }
      return d.localidade + ' (' + d.uf + ')';
    });
  };
})(window.Xandinho);
