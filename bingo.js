
// =====================
// CORES ANSI
// =====================
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

const PRETO = "\x1b[30m";
const VERMELHO = "\x1b[31m";
const VERDE = "\x1b[32m";
const AMARELO = "\x1b[33m";
const AZUL = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const CIANO = "\x1b[36m";
const BRANCO = "\x1b[37m";

// RGB (True Color)
const ROXO = "\x1b[38;2;132;94;247m";
const AZUL_NEON = "\x1b[38;2;0;255;255m";
const VERDE_NEON = "\x1b[38;2;0;255;120m";
const DOURADO = "\x1b[38;2;255;215;0m";
const LARANJA = "\x1b[38;2;255;140;0m";
const ROSA = "\x1b[38;2;255;20;147m";


// Importa o módulo readline para permitir entrada de dados pelo terminal
const readline = require("readline");

// Cria a interface de comunicação com o terminal
const rl = readline.createInterface({
    
    // Define que a entrada virá do teclado
    input: process.stdin,

    // Define que a saída será exibida no terminal
    output: process.stdout
});

// =====================
// CONFIGURAÇÕES
// =====================

// Quantidade máxima de números do bingo
const TOTAL_NUMEROS = 75;

// Array que armazenará os números ainda disponíveis para sorteio
let numerosDisponiveis = [];

// Array que armazenará os números já sorteados
let numerosSorteados = [];

// Variável que guardará o último número sorteado
let ultimoNumero = null;

// =====================
// CRIAR NÚMEROS DO BINGO
// =====================
function inicializarBingo() {

    // Limpa a lista de números disponíveis
    numerosDisponiveis = [];

    // Limpa o histórico de sorteios
    numerosSorteados = [];

    // Remove a informação do último número sorteado
    ultimoNumero = null;

    // Percorre os números de 1 até 75
    for (let i = 1; i <= TOTAL_NUMEROS; i++) {

        // Adiciona cada número ao array de disponíveis
        numerosDisponiveis.push(i);
    }
}

// =====================
// SORTEAR NÚMERO
// =====================
function sortearNumero() {

    // Verifica se ainda existem números disponíveis
    if (numerosDisponiveis.length === 0) {

        // Exibe a mensagem informando que todos os números já saíram
        console.log("\nNão há mais números disponíveis para sorteio.");

        // Retorna ao menu principal
        return mostrarMenu();
    }

    // Sorteia uma posição aleatória dentro do array de disponíveis
    const indice = Math.floor(Math.random() * numerosDisponiveis.length);

    // Remove o número sorteado do array de disponíveis
    const numero = numerosDisponiveis.splice(indice, 1)[0];

    // Adiciona o número ao histórico de sorteios
    numerosSorteados.push(numero);

    // Atualiza a variável do último número sorteado
    ultimoNumero = numero;

    console.clear();

    console.log(DOURADO);
    console.log("╔════════════════════════════╗");
    console.log("║      🎉 SORTEIO 🎉         ║");
    console.log("╚════════════════════════════╝");
    console.log(RESET);

    console.log(ROSA + BOLD);
    console.log("██████████████████████████████");
    console.log(`        ⭐ ${numero} ⭐`);
    console.log("██████████████████████████████");
    console.log(RESET);
    // Retorna ao menu principal
    mostrarMenu();
}

// =====================
// MOSTRAR HISTÓRICO
// =====================
function mostrarHistorico() {

    // Verifica se nenhum número foi sorteado
    if (numerosSorteados.length === 0) {

        // Informa que ainda não existem sorteios
        console.log("\nNenhum número foi sorteado ainda.");

    } else {

        // Exibe um título
    console.log(CIANO + BOLD);
    console.log("\n══════════════════════════════");
    console.log("📜 HISTÓRICO");
    console.log("══════════════════════════════");
    console.log(RESET);

    console.log(DOURADO + numerosSorteados.join(" • ") + RESET);
        // Mostra todos os números sorteados
        console.log(numerosSorteados.join(" - "));
    }

    // Retorna ao menu principal
    mostrarMenu();
}

// =====================
// MOSTRAR NÚMEROS ORDENADOS
// =====================
function mostrarNumerosOrdenados() {

    // Verifica se já existe algum número sorteado
    if (numerosSorteados.length === 0) {

        // Exibe mensagem caso não haja sorteios
        console.log(VERMELHO + "❌ Nenhum número foi sorteado ainda." + RESET);

    } else {

        // Cria uma cópia do array e ordena os números em ordem crescente
        const numerosOrdenados = [...numerosSorteados].sort((a, b) => a - b);

        // Exibe um título
        console.log(DOURADO + BOLD + "\n🎱 Números sorteados:\n" + RESET);

        // Mostra os números ordenados
        console.log(numerosOrdenados.join(VERDE_NEON + " • " + RESET));
    }

    // Retorna ao menu principal
    mostrarMenu();
}

// =====================
// PESQUISAR NÚMERO
// =====================
function pesquisarNumero() {

    // Solicita um número ao usuário
    rl.question(DOURADO + BOLD + "\n🔎 Digite um número entre [1 e 75] ➜ " + RESET, (numero) => {

        // Converte o valor digitado para tipo Number
        numero = Number(numero);

        // Verifica se o número está fora do intervalo permitido
        if (numero < 1 || numero > TOTAL_NUMEROS) {

            // Exibe mensagem de erro
            console.log("\nNúmero inválido.");

        // Verifica se o número existe na lista de sorteados
        } else if (numerosSorteados.includes(numero)) {

            // Informa que o número já foi sorteado
            console.log(VERDE + `\n✅ O número ${numero} já foi sorteado.` + RESET);

        } else {

            // Informa que o número ainda não foi sorteado
            console.log(LARANJA + `\n⏳ O número ${numero} ainda não foi sorteado.` + RESET);
        }

        // Retorna ao menu principal
        mostrarMenu();
    });
}

// =====================
// MOSTRAR STATUS
// =====================
function mostrarStatus() {

    // Exibe o título do status
    console.log(AZUL_NEON + BOLD);
    console.log("\n╔══════════════════════╗");
    console.log("║      📊 STATUS       ║");
    console.log("╚══════════════════════╝");
    console.log(RESET);

    // Mostra quantos números ainda podem ser sorteados
   console.log(VERDE + `Disponíveis : ${numerosDisponiveis.length}`);

    // Mostra quantos números já foram sorteados
   console.log(AMARELO + `Sorteados   : ${numerosSorteados.length}`);

    // Verifica se já existe um último sorteio
    if (ultimoNumero !== null) {

        // Mostra o último número sorteado
        console.log(MAGENTA + `Último      : ${ultimoNumero ?? "--"}` + RESET);

    } else {

        // Informa que ainda não houve sorteios
        console.log(LARANJA + `\n⏳ O número ainda não foi sorteado.` + RESET);
    }

    // Retorna ao menu principal
    mostrarMenu();
}

// =====================
// REINICIAR BINGO
// =====================
function reiniciarBingo() {

    // Recria todas as estruturas do jogo
    inicializarBingo();

    // Exibe mensagem de confirmação
    console.log(VERDE_NEON + BOLD);
    console.log("\n🔄 Bingo reiniciado com sucesso!");
    console.log(RESET);

    // Retorna ao menu principal
    mostrarMenu();
}

// =====================
// ENCERRAR PROGRAMA
// =====================
function encerrarPrograma() {

    // Exibe mensagem de encerramento
    console.log(VERMELHO + BOLD);
    console.log("\n👋 Obrigado por utilizar o Bingo!");
    console.log("\n Até a próxima!");
    console.log(RESET);

    // Fecha a interface readline
    rl.close();
}

// =====================
// MENU PRINCIPAL
// =====================
function mostrarMenu() {

  

    console.log(AZUL_NEON + BOLD);
    console.log("╔══════════════════════════════════════════════╗");
    console.log("║              🎱 BINGO DIGITAL 🎱             ║");
    console.log("╠══════════════════════════════════════════════╣");
    console.log(RESET);

    console.log(VERDE_NEON + " 1 ➜ Sortear número");
    console.log(" 2 ➜ Mostrar histórico");
    console.log(" 3 ➜ Encerrar");
    console.log(" 4 ➜ Reiniciar bingo");
    console.log(" 5 ➜ Mostrar status");
    console.log(" 6 ➜ Números ordenados");
    console.log(" 7 ➜ Pesquisar número" + RESET);

    console.log(AZUL_NEON);
    console.log("╚══════════════════════════════════════════════╝");
    console.log(RESET);

    rl.question(DOURADO + "\nEscolha uma opção ➜ " + RESET, (opcao) => {

        if (opcao === "1") {

            sortearNumero();

        } else if (opcao === "2") {

            mostrarHistorico();

        } else if (opcao === "3") {

            encerrarPrograma();

        } else if (opcao === "4") {

            reiniciarBingo();

        } else if (opcao === "5") {

            mostrarStatus();

        } else if (opcao === "6") {

            mostrarNumerosOrdenados();

        } else if (opcao === "7") {

            pesquisarNumero();

        } else {

            console.log(VERMELHO + "\n❌ Opção inválida!" + RESET);

            mostrarMenu();
        }

    });

}
// =====================
// INICIAR PROGRAMA
// =====================

// Exibe mensagem inicial
console.log(DOURADO + "🎱 Bem-vindo ao Bingo Digital 🎱\n" + RESET);

// Inicializa as listas do bingo
inicializarBingo();

// Abre o menu principal
mostrarMenu();