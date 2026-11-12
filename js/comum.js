/* Script comum a todas as páginas: menu no celular, topo que encolhe e formatação de valores. */
window.Xandinho = window.Xandinho || {};
document.documentElement.classList.add('js');

(function (Xandinho) {
  'use strict';

  var moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  Xandinho.formatarMoeda = function (valor) { return moeda.format(valor); };

  document.addEventListener('DOMContentLoaded', function () {
    var botaoMenu = document.querySelector('.menu-botao');
    var navegacao = document.getElementById('navegacao');
    if (botaoMenu && navegacao) {
      botaoMenu.addEventListener('click', function () {
        var aberto = botaoMenu.getAttribute('aria-expanded') === 'true';
        botaoMenu.setAttribute('aria-expanded', aberto ? 'false' : 'true');
        botaoMenu.textContent = aberto ? 'Menu' : 'Fechar';
        navegacao.classList.toggle('esta-aberta', !aberto);
      });
    }

    var topo = document.querySelector('.topo');
    if (topo) {
      var ajustarTopo = function () { topo.classList.toggle('topo--compacto', window.scrollY > 24); };
      window.addEventListener('scroll', ajustarTopo, { passive: true });
      ajustarTopo();
    }
  });
})(window.Xandinho);
