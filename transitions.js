(function () {
  // === Fade-out navigation between internal HTML pages ===
  function isSameOrigin(url) {
    try {
      var u = new URL(url, window.location.href);
      return u.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  function shouldHandle(a) {
    if (!a || !a.href) return false;
    var href = a.getAttribute('href') || '';
    if (a.getAttribute('target') === '_blank') return false;
    if (href.startsWith('#')) return false;
    if (!/\.html(\?|#|$)/i.test(href)) return false;
    return isSameOrigin(a.href);
  }

  function attachLinkTransitions() {
    document.querySelectorAll('a').forEach(function (a) {
      if (!shouldHandle(a)) return;
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // respetar atalhos / nova aba
        e.preventDefault();
        var href = a.href;
        var isFastTransition = a.classList.contains('fast-transition');
        var isMediumTransition = a.classList.contains('medium-transition');
        
        // Fechar menu se estiver aberto
        var menuOverlay = document.getElementById('menu-overlay');
        if (menuOverlay && menuOverlay.classList.contains('open')) {
          menuOverlay.classList.remove('open');
          document.body.classList.remove('menu-open');
          // Esperar menu fechar completamente (700ms) antes de iniciar transição
          setTimeout(function() {
            startPageTransition(href, isFastTransition, isMediumTransition);
          }, 700);
        } else {
          startPageTransition(href, isFastTransition, isMediumTransition);
        }
      });
    });
  }
  
  function startPageTransition(href, isFast, isMedium) {
    if (isFast) {
      // Transição rápida original para "Conheça a história"
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position: fixed; inset: 0; background: #374547; z-index: 9999; opacity: 0; transition: opacity 900ms ease-in-out;';
      document.body.appendChild(overlay);
      
      setTimeout(function() {
        overlay.style.opacity = '1';
      }, 10);
      
      setTimeout(function () {
        window.location.href = href;
      }, 900);
    } else if (isMedium) {
      // Transição média para confessionário e info
      document.body.style.transition = 'opacity 500ms ease-out';
      document.body.style.opacity = '0';
      
      setTimeout(function() {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; inset: 0; background: #374547; z-index: 9999; opacity: 0; transition: opacity 550ms ease-in-out;';
        document.body.appendChild(overlay);
        
        setTimeout(function() {
          overlay.style.opacity = '1';
        }, 10);
        
        setTimeout(function () {
          window.location.href = href;
        }, 550);
      }, 150);
    } else {
      // Fade out do body atual (suave para legado)
      document.body.style.transition = 'opacity 750ms ease-out';
      document.body.style.opacity = '0';
      
      // Criar overlay de transição após body começar fade
      setTimeout(function() {
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; inset: 0; background: #374547; z-index: 9999; opacity: 0; transition: opacity 800ms ease-in-out;';
        document.body.appendChild(overlay);
        
        // Forçar reflow e animar
        setTimeout(function() {
          overlay.style.opacity = '1';
        }, 10);
        
        // Navegar após overlay estar visível
        setTimeout(function () {
          window.location.href = href;
        }, 800);
      }, 300);
    }
  }

  // === Ensure menu looks and behaves like in index (CSS order + handlers) ===
  function ensureStyle1Last() {
    var head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;
    var links = Array.prototype.slice.call(document.querySelectorAll('link[rel="stylesheet"]'));
    var style1 = links.find(function (l) {
      var href = (l.getAttribute('href') || '').split('?')[0];
      return /(^|\/)style1\.css$/i.test(href);
    });

    if (!style1) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'style1.css';
      head.appendChild(link);
    } else {
      // move para o fim para garantir precedência
      head.appendChild(style1);
    }
  }

  function attachMenuHandlers() {
    var menuBtn = document.querySelector('.menu');
    var overlay = document.getElementById('menu-overlay');
    var closeBtn = overlay ? overlay.querySelector('.close-menu') : null;

    if (menuBtn && overlay) {
      menuBtn.addEventListener('click', function () {
        overlay.classList.add('open');
        document.body.classList.add('menu-open');
      });
    }

    if (closeBtn && overlay) {
      closeBtn.addEventListener('click', function () {
        overlay.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
    }

    // Fechar com tecla ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
        overlay.classList.remove('open');
        document.body.classList.remove('menu-open');
      }
    });

    // Fechar ao clicar fora do menu
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          overlay.classList.remove('open');
          document.body.classList.remove('menu-open');
        }
      });
    }
  }

  window.addEventListener('DOMContentLoaded', function () {
    // Scroll para o topo e bloquear scroll durante carregamento
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = 'auto';
    
    ensureStyle1Last();
    attachMenuHandlers();
    attachLinkTransitions();
    
    // Delay antes de mostrar a página para transição suave
    setTimeout(function() {
      document.body.style.opacity = '1';
    }, 100);
  });

  // Garantir que ao voltar pelo cache de histórico o body aparece visível
  window.addEventListener('pageshow', function (e) {
    window.scrollTo(0, 0);
    if (e.persisted) {
      document.body.style.opacity = '1';
    }
  });
})();
