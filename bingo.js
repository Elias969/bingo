const readline = require("readline");

// ============================================================
// CONFIGURAÇÕES — altere cores, textos e opções aqui
// ============================================================

const TOTAL_NUMEROS = 75;
const LARGURA_TELA = 58;

// Paleta Neon / Cassino Retrô (códigos ANSI)
const cores = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  neonPink: "\x1b[95m",
  neonCyan: "\x1b[96m",
  neonYellow: "\x1b[93m",
  neonGreen: "\x1b[92m",
  neonRed: "\x1b[91m",
  neonBlue: "\x1b[94m",
  neonMagenta: "\x1b[35m",
  white: "\x1b[37m",
};

// Opções do menu — adicione ou remova itens aqui
const opcoesMenu = [
  { id: "sortear", icone: "🎲", texto: "SORTEAR NÚMERO" },
  { id: "historico", icone: "📜", texto: "VER HISTÓRICO" },
  { id: "verificar", icone: "🎯", texto: "VERIFICAR CARTELA" },
  { id: "limpar", icone: "🧹", texto: "LIMPAR HISTÓRICO" },
  { id: "sair", icone: "🚪", texto: "SAIR" },
];

// Textos da tela inicial
const tituloJogo = "B I N G O   A R C A D E";
const subtituloJogo = "★  Cassino Retrô Neon  ★";

// Mensagens da animação de sorteio
const mensagensSorteio = [
  "🎰 O globo está girando...",
  "✨ A sorte está decidindo...",
  "🎲 Número revelado!",
];

// ============================================================
// ESTADO DO JOGO
// ============================================================

let numerosDisponiveis = [];
let numerosSorteados = [];
let ultimoNumero = null;

let indiceMenu = 0;
let telaAtual = "splash"; // splash | menu | historico | sorteio | mensagem | verificar_entrada | verificar_resultado
let mensagemExtra = "";
let bloqueado = false;
let textoEntradaCartela = "";

// ============================================================
// ARTE ASCII DOS DÍGITOS (0-9)
// ============================================================


const arteDigitos = {
  0: [" ███ ", "█   █", "█   █", "█   █", " ███ "],
  1: ["  █  ", " ██  ", "  █  ", "  █  ", " ███ "],
  2: [" ███ ", "    █", " ███ ", "█    ", " ███ "],
  3: [" ███ ", "    █", " ███ ", "    █", " ███ "],
  4: ["█   █", "█   █", " ███ ", "    █", "    █"],
  5: [" ███ ", "█    ", " ███ ", "    █", " ███ "],
  6: [" ███ ", "█    ", " ███ ", "█   █", " ███ "],
  7: [" ███ ", "    █", "   █ ", "  █  ", "  █  "],
  8: [" ███ ", "█   █", " ███ ", "█   █", " ███ "],
  9: [" ███ ", "█   █", " ███ ", "    █", " ███ "],
};

// ============================================================
// UTILITÁRIOS DE TERMINAL
// ============================================================

function esconderCursor() {
  process.stdout.write("\x1b[?25l");
}

function mostrarCursor() {
  process.stdout.write("\x1b[?25h");
}

function limparTela() {
  process.stdout.write("\x1b[2J\x1b[H");
}

function centralizar(texto, largura = LARGURA_TELA) {
  const textoLimpo = texto.replace(/\x1b\[[0-9;]*m/g, "");
  const espacos = Math.max(0, Math.floor((largura - textoLimpo.length) / 2));
  return " ".repeat(espacos) + texto;
}

function repetir(char, vezes) {
  return char.repeat(vezes);
}

function dormir(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function montarArteAscii(numero) {
  const digitos = String(numero).padStart(2, "0").split("");
  const linhas = ["", "", "", "", ""];

  digitos.forEach((digito, indice) => {
    const arte = arteDigitos[Number(digito)];
    arte.forEach((linha, i) => {
      const espaco = indice > 0 ? "   " : "";
      linhas[i] += espaco + linha;
    });
  });

  return linhas;
}

// ============================================================
// LÓGICA DO BINGO
// ============================================================

function inicializarBingo() {
  numerosDisponiveis = [];
  numerosSorteados = [];
  ultimoNumero = null;

  for (let i = 1; i <= TOTAL_NUMEROS; i++) {
    numerosDisponiveis.push(i);
  }
}

function obterNumeroSorteado() {
  const indice = Math.floor(Math.random() * numerosDisponiveis.length);
  const numero = numerosDisponiveis.splice(indice, 1)[0];
  numerosSorteados.push(numero);
  ultimoNumero = numero;
  return numero;
}

function limparHistorico() {
  inicializarBingo();
  mensagemExtra = `${cores.neonGreen}🧹 Histórico limpo! O globo está pronto para girar de novo.${cores.reset}`;
  telaAtual = "mensagem";
}

function parsearNumerosCartela(texto) {
  const partes = texto.split(/[\s,;]+/).filter(Boolean);
  const numeros = [];
  const invalidos = [];

  partes.forEach((parte) => {
    const numero = Number(parte);

    if (!Number.isInteger(numero) || numero < 1 || numero > TOTAL_NUMEROS) {
      invalidos.push(parte);
    } else if (!numeros.includes(numero)) {
      numeros.push(numero);
    }
  });

  return { numeros, invalidos };
}

function verificarNumerosCartela(numeros) {
  const acertos = [];
  const erros = [];

  numeros.forEach((numero) => {
    if (numerosSorteados.includes(numero)) {
      acertos.push(numero);
    } else {
      erros.push(numero);
    }
  });

  acertos.sort((a, b) => a - b);
  erros.sort((a, b) => a - b);

  return { acertos, erros };
}

function formatarListaNumeros(numeros, cor) {
  if (numeros.length === 0) {
    return `${cores.dim}nenhum${cores.reset}`;
  }

  return numeros
    .map((n) => `${cor}${cores.bright}${String(n).padStart(2, "0")}${cores.reset}`)
    .join("  ");
}

// ============================================================
// DESENHO DA INTERFACE
// ============================================================

function desenharBordaSuperior() {
  return `${cores.neonCyan}╔${repetir("═", LARGURA_TELA - 2)}╗${cores.reset}`;
}

function desenharBordaInferior() {
  return `${cores.neonCyan}╚${repetir("═", LARGURA_TELA - 2)}╝${cores.reset}`;
}

function desenharLinhaVazia() {
  return `${cores.neonCyan}║${cores.reset}${repetir(" ", LARGURA_TELA - 2)}${cores.neonCyan}║${cores.reset}`;
}

function desenharLinhaTexto(texto) {
  const textoLimpo = texto.replace(/\x1b\[[0-9;]*m/g, "");
  const espacoDireita = Math.max(0, LARGURA_TELA - 2 - textoLimpo.length);
  return `${cores.neonCyan}║${cores.reset}${texto}${repetir(" ", espacoDireita)}${cores.neonCyan}║${cores.reset}`;
}

function desenharCabecalho() {
  const linhas = [];

  linhas.push(desenharBordaSuperior());
  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.neonPink}${cores.bright}🎰  ${tituloJogo}  🎰${cores.reset}`)
    )
  );
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.neonYellow}${subtituloJogo}${cores.reset}`)
    )
  );
  linhas.push(desenharLinhaVazia());
  linhas.push(`${cores.neonCyan}╠${repetir("═", LARGURA_TELA - 2)}╣${cores.reset}`);

  return linhas;
}

function desenharRodape() {
  const sorteados = numerosSorteados.length;
  const restantes = numerosDisponiveis.length;
  const ultimo = ultimoNumero !== null ? String(ultimoNumero).padStart(2, "0") : "--";

  const linhas = [];
  linhas.push(`${cores.neonCyan}╠${repetir("═", LARGURA_TELA - 2)}╣${cores.reset}`);
  linhas.push(
    desenharLinhaTexto(
      centralizar(
        `${cores.dim}Sorteados: ${cores.neonGreen}${sorteados}${cores.dim}/${TOTAL_NUMEROS}  │  Restantes: ${cores.neonBlue}${restantes}${cores.dim}  │  Último: ${cores.neonYellow}${ultimo}${cores.reset}`
      )
    )
  );
  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.dim}↑ ↓ navegar  │  ENTER selecionar  │  ESC sair${cores.reset}`)
    )
  );
  linhas.push(desenharBordaInferior());

  return linhas;
}

function desenharMenu() {
  const linhas = [];

  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.neonMagenta}${cores.bright}▸  M E N U  P R I N C I P A L  ◂${cores.reset}`)
    )
  );
  linhas.push(desenharLinhaVazia());

  opcoesMenu.forEach((opcao, indice) => {
    const selecionado = indice === indiceMenu;

    if (selecionado) {
      const item = `${cores.neonYellow}${cores.bright}  ►  ${opcao.icone}  ${opcao.texto}  ◄  ${cores.reset}`;
      linhas.push(desenharLinhaTexto(centralizar(item)));
    } else {
      const item = `${cores.dim}     ${opcao.icone}  ${opcao.texto}${cores.reset}`;
      linhas.push(desenharLinhaTexto(centralizar(item)));
    }
  });

  linhas.push(desenharLinhaVazia());

  if (mensagemExtra) {
    linhas.push(desenharLinhaTexto(centralizar(mensagemExtra)));
    linhas.push(desenharLinhaVazia());
  }

  return linhas;
}

function desenharMiniCartela() {
  const linhas = [];
  const letras = ["B", "I", "N", "G", "O"];
  const inicios = [1, 16, 31, 46, 61];

  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.neonCyan}${cores.bright}╭─ CARTELA BINGO AO VIVO ─╮${cores.reset}`)
    )
  );

  const cabecalho = letras
    .map((letra) => `${cores.neonPink}${cores.bright} ${letra}  ${cores.reset}`)
    .join("");
  linhas.push(desenharLinhaTexto(centralizar(cabecalho)));

  for (let linha = 0; linha < 5; linha++) {
    let celulas = "";

    for (let coluna = 0; coluna < 5; coluna++) {
      const numero = inicios[coluna] + linha;
      const texto = String(numero).padStart(2, "0");

      if (numerosSorteados.includes(numero)) {
        celulas += `${cores.neonYellow}${cores.bright}[${texto}]${cores.reset} `;
      } else {
        celulas += `${cores.dim} ${texto} ${cores.reset} `;
      }
    }

    linhas.push(desenharLinhaTexto(centralizar(celulas)));
  }

  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.dim}... exibindo amostra — veja o painel completo no histórico${cores.reset}`)
    )
  );

  return linhas;
}

function desenharCartelaCompleta() {
  const linhas = [];
  const letras = ["B", "I", "N", "G", "O"];
  const inicios = [1, 16, 31, 46, 61];

  const cabecalho = letras
    .map((letra) => `${cores.neonPink}${cores.bright} ${letra}  ${cores.reset}`)
    .join("");
  linhas.push(desenharLinhaTexto(centralizar(cabecalho)));

  for (let linha = 0; linha < 15; linha++) {
    let celulas = "";

    for (let coluna = 0; coluna < 5; coluna++) {
      const numero = inicios[coluna] + linha;
      const texto = String(numero).padStart(2, "0");

      if (numerosSorteados.includes(numero)) {
        celulas += `${cores.neonYellow}${cores.bright}[${texto}]${cores.reset} `;
      } else {
        celulas += `${cores.dim} ${texto} ${cores.reset} `;
      }
    }

    linhas.push(desenharLinhaTexto(centralizar(celulas)));
  }

  return linhas;
}

function desenharPainelHistorico() {
  const linhas = [];

  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.neonPink}${cores.bright}📋  P A I N E L  D E  H I S T Ó R I C O${cores.reset}`)
    )
  );
  linhas.push(desenharLinhaVazia());

  if (numerosSorteados.length === 0) {
    linhas.push(
      desenharLinhaTexto(
        centralizar(`${cores.neonYellow}Nenhum número sorteado ainda. Gire o globo!${cores.reset}`)
      )
    );
  } else {
    const ordenados = [...numerosSorteados].sort((a, b) => a - b);
    const colunas = 8;
    const grupos = [];

    for (let i = 0; i < ordenados.length; i += colunas) {
      grupos.push(ordenados.slice(i, i + colunas));
    }

    grupos.forEach((grupo) => {
      const texto = grupo
        .map((n) => `${cores.neonGreen}${cores.bright}${String(n).padStart(2, "0")}${cores.reset}`)
        .join("  ");
      linhas.push(desenharLinhaTexto(centralizar(texto)));
    });

    linhas.push(desenharLinhaVazia());
    linhas.push(
      desenharLinhaTexto(
        centralizar(`${cores.neonCyan}${cores.bright}╭─ CARTELA COMPLETA ─╮${cores.reset}`)
      )
    );
    linhas.push(...desenharCartelaCompleta());
  }

  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.dim}Pressione qualquer tecla para voltar ao menu${cores.reset}`)
    )
  );

  return linhas;
}

function desenharTelaVerificarEntrada() {
  const linhas = [];

  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.neonPink}${cores.bright}🎯  V E R I F I C A R  C A R T E L A${cores.reset}`)
    )
  );
  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.white}Digite os números da sua cartela${cores.reset}`)
    )
  );
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.dim}(separe por espaço, vírgula ou ponto e vírgula)${cores.reset}`)
    )
  );
  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(
        `${cores.neonCyan}▸ ${cores.neonYellow}${textoEntradaCartela}${cores.neonCyan}█${cores.reset}`
      )
    )
  );
  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.dim}Exemplo: 3, 7, 15, 22, 45, 61${cores.reset}`)
    )
  );
  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.dim}ENTER confirmar  │  ESC cancelar${cores.reset}`)
    )
  );

  return linhas;
}

function desenharPainelVerificacao() {
  const linhas = [];
  const { numeros, invalidos } = parsearNumerosCartela(textoEntradaCartela);
  const { acertos, erros } = verificarNumerosCartela(numeros);
  const totalValidos = numeros.length;

  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.neonPink}${cores.bright}🎯  R E S U L T A D O  D A  C A R T E L A${cores.reset}`)
    )
  );
  linhas.push(desenharLinhaVazia());

  if (totalValidos === 0 && invalidos.length === 0) {
    linhas.push(
      desenharLinhaTexto(
        centralizar(`${cores.neonYellow}Nenhum número foi informado.${cores.reset}`)
      )
    );
  } else {
    linhas.push(
      desenharLinhaTexto(
        centralizar(
          `${cores.neonGreen}${cores.bright}✅ ACERTOS (já sorteados):${cores.reset}`
        )
      )
    );
    linhas.push(
      desenharLinhaTexto(
        centralizar(formatarListaNumeros(acertos, cores.neonGreen))
      )
    );
    linhas.push(desenharLinhaVazia());
    linhas.push(
      desenharLinhaTexto(
        centralizar(
          `${cores.neonRed}${cores.bright}❌ ERROS (ainda não sorteados):${cores.reset}`
        )
      )
    );
    linhas.push(
      desenharLinhaTexto(
        centralizar(formatarListaNumeros(erros, cores.neonRed))
      )
    );

    if (invalidos.length > 0) {
      linhas.push(desenharLinhaVazia());
      linhas.push(
        desenharLinhaTexto(
          centralizar(
            `${cores.neonYellow}${cores.bright}⚠️  INVÁLIDOS (fora de 1-${TOTAL_NUMEROS}):${cores.reset}`
          )
        )
      );
      linhas.push(
        desenharLinhaTexto(
          centralizar(
            invalidos
              .map((item) => `${cores.neonYellow}${item}${cores.reset}`)
              .join("  ")
          )
        )
      );
    }

    linhas.push(desenharLinhaVazia());
    linhas.push(
      desenharLinhaTexto(
        centralizar(
          `${cores.neonCyan}${cores.bright}Placar: ${acertos.length} acerto(s) de ${totalValidos} número(s)${cores.reset}`
        )
      )
    );
  }

  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.dim}ENTER voltar ao menu  │  ESC digitar de novo${cores.reset}`)
    )
  );

  return linhas;
}

function desenharTelaSorteio(mensagem, numeroPreview = null) {
  const linhas = [];

  linhas.push(desenharLinhaVazia());
  linhas.push(desenharLinhaTexto(centralizar(`${cores.neonPink}${cores.bright}${mensagem}${cores.reset}`)));
  linhas.push(desenharLinhaVazia());

  if (numeroPreview !== null) {
    const arte = montarArteAscii(numeroPreview);
    arte.forEach((linhaArte) => {
      linhas.push(
        desenharLinhaTexto(
          centralizar(`${cores.neonCyan}${cores.bright}${linhaArte}${cores.reset}`)
        )
      );
    });
  }

  return linhas;
}

function desenharTelaSplash() {
  const linhas = [];

  linhas.push(desenharBordaSuperior());
  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.neonPink}${cores.bright}✦ ✦ ✦  BEM-VINDO  ✦ ✦ ✦${cores.reset}`)
    )
  );
  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.neonYellow}${cores.bright}🎰  ${tituloJogo}  🎰${cores.reset}`)
    )
  );
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.neonCyan}${subtituloJogo}${cores.reset}`)
    )
  );
  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.neonGreen}Prepare-se para a sorte grande!${cores.reset}`)
    )
  );
  linhas.push(desenharLinhaVazia());
  linhas.push(
    desenharLinhaTexto(
      centralizar(`${cores.dim}Pressione ENTER para começar...${cores.reset}`)
    )
  );
  linhas.push(desenharLinhaVazia());
  linhas.push(desenharBordaInferior());

  return linhas;
}

function renderizarTela(conteudoExtra = []) {
  limparTela();

  const linhas = [];

  if (telaAtual === "splash") {
    linhas.push(...desenharTelaSplash());
  } else {
    linhas.push(...desenharCabecalho());

    if (telaAtual === "menu" || telaAtual === "mensagem") {
      linhas.push(...conteudoExtra);
      linhas.push(...desenharMenu());
      linhas.push(...desenharMiniCartela());
      linhas.push(...desenharRodape());
    } else if (telaAtual === "historico") {
      linhas.push(...desenharPainelHistorico());
      linhas.push(desenharBordaInferior());
    } else if (telaAtual === "sorteio") {
      linhas.push(...conteudoExtra);
      linhas.push(desenharBordaInferior());
    } else if (telaAtual === "verificar_entrada") {
      linhas.push(...desenharTelaVerificarEntrada());
      linhas.push(desenharBordaInferior());
    } else if (telaAtual === "verificar_resultado") {
      linhas.push(...desenharPainelVerificacao());
      linhas.push(desenharBordaInferior());
    }
  }

  process.stdout.write(linhas.join("\n") + "\n");
}

// ============================================================
// ANIMAÇÃO E SORTEIO
// ============================================================

async function animarSorteio(numeroFinal) {
  bloqueado = true;
  telaAtual = "sorteio";

  // Fase 1 — globo girando com números aleatórios
  for (let i = 0; i < 14; i++) {
    const preview = numerosDisponiveis[Math.floor(Math.random() * numerosDisponiveis.length)];
    renderizarTela(desenharTelaSorteio(mensagensSorteio[0], preview));
    await dormir(90);
  }

  // Fase 2 — sorte decidindo
  for (let i = 0; i < 8; i++) {
    const preview = numerosDisponiveis[Math.floor(Math.random() * numerosDisponiveis.length)];
    renderizarTela(desenharTelaSorteio(mensagensSorteio[1], preview));
    await dormir(120);
  }

  // Fase 3 — revelação final
  const arteFinal = montarArteAscii(numeroFinal);
  const conteudo = [
    ...desenharTelaSorteio(mensagensSorteio[2], null),
    desenharLinhaVazia(),
    ...arteFinal.map((linha) =>
      desenharLinhaTexto(
        centralizar(`${cores.neonYellow}${cores.bright}${linha}${cores.reset}`)
      )
    ),
    desenharLinhaVazia(),
    desenharLinhaTexto(
      centralizar(
        `${cores.neonGreen}${cores.bright}★ NÚMERO ${String(numeroFinal).padStart(2, "0")} SORTEADO! ★${cores.reset}`
      )
    ),
    desenharLinhaVazia(),
    desenharLinhaTexto(
      centralizar(`${cores.dim}Pressione qualquer tecla para voltar ao menu${cores.reset}`)
    ),
  ];

  renderizarTela(conteudo);
  bloqueado = false;
}

async function sortearNumero() {
  if (numerosDisponiveis.length === 0) {
    mensagemExtra = `${cores.neonRed}🎰 Todos os ${TOTAL_NUMEROS} números já foram sorteados!${cores.reset}`;
    telaAtual = "mensagem";
    renderizarTela();
    return;
  }

  const numero = obterNumeroSorteado();
  await animarSorteio(numero);

  telaAtual = "menu";
  mensagemExtra = `${cores.neonGreen}Último sorteio: ${cores.neonYellow}${cores.bright}${String(numero).padStart(2, "0")}${cores.reset}`;
}

function mostrarHistorico() {
  telaAtual = "historico";
  renderizarTela();
}

function iniciarVerificarCartela() {
  textoEntradaCartela = "";
  telaAtual = "verificar_entrada";
  renderizarTela();
}

function confirmarVerificacaoCartela() {
  telaAtual = "verificar_resultado";
  renderizarTela();
}

function voltarParaEntradaCartela() {
  telaAtual = "verificar_entrada";
  renderizarTela();
}

// ============================================================
// NAVEGAÇÃO E CONTROLE
// ============================================================

function moverMenu(direcao) {
  if (direcao === "cima") {
    indiceMenu = (indiceMenu - 1 + opcoesMenu.length) % opcoesMenu.length;
  } else {
    indiceMenu = (indiceMenu + 1) % opcoesMenu.length;
  }

  mensagemExtra = "";
  renderizarTela();
}

async function selecionarOpcao() {
  const opcao = opcoesMenu[indiceMenu];

  switch (opcao.id) {
    case "sortear":
      await sortearNumero();
      break;
    case "historico":
      mostrarHistorico();
      break;
    case "verificar":
      iniciarVerificarCartela();
      break;
    case "limpar":
      limparHistorico();
      renderizarTela();
      break;
    case "sair":
      sairSistema();
      break;
  }
}

function voltarAoMenu() {
  mensagemExtra = "";
  textoEntradaCartela = "";
  telaAtual = "menu";
  renderizarTela();
}

function sairSistema() {
  limparTela();
  mostrarCursor();

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }

  process.stdin.pause();
  console.log(`${cores.neonPink}${cores.bright}\n🎰 Obrigado por jogar no Bingo Arcade! Até a próxima! 🎰${cores.reset}\n`);
  process.exit(0);
}

function tratarTeclaEntradaCartela(str, tecla) {
  if (tecla.name === "escape") {
    voltarAoMenu();
    return;
  }

  if (tecla.name === "return" || tecla.name === "enter") {
    confirmarVerificacaoCartela();
    return;
  }

  if (tecla.name === "backspace") {
    textoEntradaCartela = textoEntradaCartela.slice(0, -1);
    renderizarTela();
    return;
  }

  if (str && /^[\d,\s;]$/.test(str) && textoEntradaCartela.length < 100) {
    textoEntradaCartela += str;
    renderizarTela();
  }
}

function tratarTeclaResultadoCartela(tecla) {
  if (tecla.name === "escape") {
    voltarParaEntradaCartela();
    return;
  }

  if (tecla.name === "return" || tecla.name === "enter") {
    voltarAoMenu();
  }
}

function tratarTecla(tecla, str = "") {
  if (bloqueado) {
    return;
  }

  const { name, sequence } = tecla;

  if (telaAtual === "verificar_entrada") {
    tratarTeclaEntradaCartela(str, tecla);
    return;
  }

  if (telaAtual === "verificar_resultado") {
    tratarTeclaResultadoCartela(tecla);
    return;
  }

  if (telaAtual === "splash") {
    if (name === "return" || name === "enter") {
      telaAtual = "menu";
      renderizarTela();
    }
    return;
  }

  if (telaAtual === "historico" || telaAtual === "sorteio") {
    voltarAoMenu();
    return;
  }

  if (telaAtual === "mensagem") {
    mensagemExtra = "";
    telaAtual = "menu";
    renderizarTela();
    return;
  }

  if (name === "up") {
    moverMenu("cima");
    return;
  }

  if (name === "down") {
    moverMenu("baixo");
    return;
  }

  if (name === "return" || name === "enter") {
    selecionarOpcao();
    return;
  }

  if (name === "escape" || (name === "c" && tecla.ctrl)) {
    sairSistema();
    return;
  }

  // Setas alternativas (alguns terminais)
  if (sequence === "\x1b[A") moverMenu("cima");
  if (sequence === "\x1b[B") moverMenu("baixo");
}

function iniciarControles() {
  readline.emitKeypressEvents(process.stdin);

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  process.stdin.resume();
  esconderCursor();

  process.stdin.on("keypress", (str, key) => {
    if (!key) return;
    tratarTecla(key, str);
  });
}

// ============================================================
// INICIAR O SISTEMA
// ============================================================

function iniciarSistema() {
  inicializarBingo();
  iniciarControles();
  renderizarTela();
}

iniciarSistema();