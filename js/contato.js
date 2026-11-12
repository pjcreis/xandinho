/* Formulário "Fale com a equipe": valida os campos e abre o WhatsApp
   com a mensagem pronta para o número da equipe. */
(function () {
  'use strict';

  var WHATSAPP_EQUIPE = '5527981858803';

  function porId(id) { return document.getElementById(id); }

  function marcarErro(id, mensagem) {
    porId('erro-' + id).textContent = mensagem || '';
    porId(id).setAttribute('aria-invalid', mensagem ? 'true' : 'false');
    return mensagem ? { id: id, mensagem: mensagem } : null;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = porId('form-contato');
    if (!form) { return; }
    var listaErros = porId('contato-erros');
    var sucesso = porId('contato-sucesso');

    form.addEventListener('input', function (evento) {
      if (porId('erro-' + evento.target.id)) { marcarErro(evento.target.id, ''); }
    });

    form.addEventListener('submit', function (evento) {
      evento.preventDefault();
      var nome = porId('contato-nome').value.trim();
      var assunto = porId('contato-assunto');
      var mensagem = porId('contato-mensagem').value.trim();
      var erros = [
        marcarErro('contato-nome', nome.length < 2 ? 'Digite o seu nome.' : ''),
        marcarErro('contato-assunto', assunto.value ? '' : 'Escolha um assunto.'),
        marcarErro('contato-mensagem', mensagem.length < 10 ? 'Escreva pelo menos 10 caracteres.' : '')
      ].filter(Boolean);

      listaErros.textContent = '';
      sucesso.hidden = true;
      if (erros.length) {
        var titulo = document.createElement('p');
        titulo.textContent = erros.length === 1 ? 'Falta ajustar 1 campo:' : 'Faltam ajustar ' + erros.length + ' campos:';
        var ul = document.createElement('ul');
        erros.forEach(function (erro) {
          var li = document.createElement('li');
          li.textContent = erro.mensagem;
          ul.appendChild(li);
        });
        listaErros.append(titulo, ul);
        listaErros.hidden = false;
        porId(erros[0].id).focus();
        return;
      }

      listaErros.hidden = true;
      var texto = 'Olá, equipe do Xandinho! Meu nome é ' + nome + '.\n' +
        'Assunto: ' + assunto.options[assunto.selectedIndex].text + '\n' + mensagem;
      var link = 'https://wa.me/' + WHATSAPP_EQUIPE + '?text=' + encodeURIComponent(texto);
      porId('contato-link').href = link;
      sucesso.hidden = false;
      sucesso.focus();
      window.open(link, '_blank', 'noopener');
      form.reset();
    });
  });
})();
