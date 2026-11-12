/* Página inicial: mostra os programas do catálogo. */
(function (Xandinho) {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var lista = document.getElementById('lista-programas');
    if (!lista) { return; }
    Xandinho.direitos.forEach(function (item) {
      var oportunidade = item.categoria === 'oportunidade';
      var li = document.createElement('li');
      li.className = 'programa';
      var selo = document.createElement('span');
      selo.className = 'selo ' + (oportunidade ? 'selo--info' : 'selo--sim');
      selo.textContent = oportunidade ? 'Oportunidade' : 'Direito';
      var nome = document.createElement('h3');
      nome.className = 'programa__nome';
      nome.textContent = item.nome;
      var texto = document.createElement('p');
      texto.textContent = item.oQueE;
      li.append(selo, nome, texto);
      lista.appendChild(li);
    });
  });
})(window.Xandinho);
