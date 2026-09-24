const botao = document.getElementById("botaoLer");
const arquivoPDF = document.getElementById("arquivoPDF");
const dataEscala = document.getElementById("dataEscala");

const status = document.getElementById("status");
const escala = document.getElementById("escala");
const lembrete = document.getElementById("textoLembrete");


botao.addEventListener("click", lerPDF);


// ========================================
// LER PDF
// ========================================

async function lerPDF() {

    const arquivo = arquivoPDF.files[0];
    const data = dataEscala.value.trim();


    if (!arquivo) {

        status.innerHTML =
            "⚠️ Selecione o PDF primeiro.";

        return;
    }


    if (!data) {

        status.innerHTML =
            "⚠️ Digite a data da escala.";

        return;
    }


    status.innerHTML =
        "⏳ Lendo o PDF...";


    try {

        const dados =
            await arquivo.arrayBuffer();


        const pdf =
            await pdfjsLib.getDocument({
                data: dados
            }).promise;


        let textoCompleto = "";


        for (
            let numeroPagina = 1;
            numeroPagina <= pdf.numPages;
            numeroPagina++
        ) {

            status.innerHTML =
                `⏳ Lendo página ${numeroPagina} de ${pdf.numPages}...`;


            const pagina =
                await pdf.getPage(numeroPagina);


            const conteudo =
                await pagina.getTextContent();


            const textoPagina =
                conteudo.items
                    .map(item => item.str)
                    .join(" ");


            textoCompleto +=
                textoPagina + "\n";
        }


        console.log(
            "========== TEXTO ORIGINAL =========="
        );

        console.log(textoCompleto);


        // Normaliza o texto
        const textoNormalizado =
            normalizarTexto(textoCompleto);


        console.log(
            "========== TEXTO NORMALIZADO =========="
        );

        console.log(textoNormalizado);


        interpretarEscala(
            textoNormalizado,
            data
        );


    } catch (erro) {

        console.error(
            "ERRO:",
            erro
        );


        status.innerHTML =
            "❌ Erro ao ler o PDF.";

    }

}


// ========================================
// NORMALIZAR TEXTO
// ========================================

function normalizarTexto(texto) {

    /*
        Primeiro juntamos letras que foram
        separadas pelo PDF.

        Exemplo:

        "Audit ó rio"

        vira:

        "Auditório"
    */

    texto = texto.replace(
        /(\w)\s+([áéíóúàãõâêôç])/gi,
        "$1$2"
    );


    texto = texto.replace(
        /([áéíóúàãõâêôç])\s+(\w)/gi,
        "$1$2"
    );


    /*
        Remove acentos.
    */

    texto = texto.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");


    /*
        Coloca tudo em minúsculo.
    */

    texto = texto.toLowerCase();


    /*
        Remove espaços repetidos.
    */

    texto = texto.replace(
        /\s+/g,
        " "
    );


    return texto.trim();

}


// ========================================
// INTERPRETAR ESCALA
// ========================================

function interpretarEscala(
    texto,
    dataOriginal
) {

    /*
        Normaliza também a data.
    */

    const data =
        normalizarTexto(dataOriginal);


    /*
        Agora procuramos:

        auditorio
        microfone
        video
    */

    const posicaoAuditorio =
        texto.indexOf("auditorio");


    const posicaoMicrofone =
        texto.indexOf("microfone");


    const posicaoVideo =
        texto.indexOf("video");


    console.log(
        "Auditório:",
        posicaoAuditorio
    );

    console.log(
        "Microfone:",
        posicaoMicrofone
    );

    console.log(
        "Vídeo:",
        posicaoVideo
    );


    /*
        Verifica se encontrou
        as três tabelas.
    */

    if (
        posicaoAuditorio === -1 ||
        posicaoMicrofone === -1 ||
        posicaoVideo === -1
    ) {

        status.innerHTML = `
            <span class="erro">
                ⚠️ Ainda não consegui identificar
                as três tabelas.
            </span>
        `;

        console.log(
            "Texto normalizado:",
            texto
        );

        return;

    }


    /*
        Separa as três tabelas.
    */

    const parteAuditorio =
        texto.substring(
            posicaoAuditorio,
            posicaoMicrofone
        );


    const parteMicrofone =
        texto.substring(
            posicaoMicrofone,
            posicaoVideo
        );


    const parteVideo =
        texto.substring(
            posicaoVideo
        );


    console.log(
        "AUDITÓRIO:",
        parteAuditorio
    );


    console.log(
        "MICROFONE:",
        parteMicrofone
    );


    console.log(
        "VÍDEO:",
        parteVideo
    );


    /*
        Procura a data.
    */

    const dadosAuditorio =
        encontrarData(
            parteAuditorio,
            data
        );


    const dadosMicrofone =
        encontrarData(
            parteMicrofone,
            data
        );


    const dadosVideo =
        encontrarData(
            parteVideo,
            data
        );


    mostrarEscala(
        dataOriginal,
        dadosAuditorio,
        dadosMicrofone,
        dadosVideo
    );

}


// ========================================
// ENCONTRAR DATA
// ========================================

function encontrarData(
    texto,
    data
) {

    /*
        Aceita datas como:

        03/09
        06/09
        24/09
        01/10
    */

    const posicao =
        texto.indexOf(data);


    if (posicao === -1) {

        console.log(
            "Data não encontrada:",
            data
        );

        return null;

    }


    /*
        Pegamos o trecho a partir da data.
    */

    const trecho =
        texto.substring(
            posicao
        );


    /*
        Separa as palavras.
    */

    const palavras =
        trecho
            .split(/\s+/)
            .slice(0, 6);


    return palavras;

}


// ========================================
// MOSTRAR ESCALA
// ========================================

function mostrarEscala(
    data,
    auditorio,
    microfone,
    video
) {

    escala.innerHTML = "";


    criarTabela(
        "🎤 Auditório",
        [
            "Entrada",
            "Auditório",
            "Substituto"
        ],
        auditorio
    );


    criarTabela(
        "🎙️ Microfone",
        [
            "Microfone A",
            "Microfone B",
            "Substituto"
        ],
        microfone
    );


    criarTabela(
        "🎥 Vídeo",
        [
            "Vídeo",
            "Áudio",
            "Palco"
        ],
        video
    );


    gerarLembrete(
        data,
        auditorio,
        microfone,
        video
    );


    status.innerHTML =
        `✅ Escala de ${data} encontrada!`;

}


// ========================================
// CRIAR TABELA
// ========================================

function criarTabela(
    titulo,
    funcoes,
    dados
) {

    const div =
        document.createElement("div");


    div.className =
        "tabela";


    const tituloElemento =
        document.createElement("h3");


    tituloElemento.textContent =
        titulo;


    div.appendChild(
        tituloElemento
    );


    if (!dados) {

        const erro =
            document.createElement("p");


        erro.textContent =
            "Data não encontrada nesta tabela.";


        div.appendChild(
            erro
        );


        escala.appendChild(
            div
        );


        return;

    }


    /*
        O primeiro item é a data.

        Os próximos são:

        nome 1
        nome 2
        nome 3
    */

    const nomes =
        dados.slice(1);


    for (
        let i = 0;
        i < funcoes.length;
        i++
    ) {

        const linha =
            document.createElement("div");


        linha.className =
            "funcao";


        const nome =
            nomes[i] ||
            "Não encontrado";


        linha.innerHTML = `
            <strong>
                ${funcoes[i]}:
            </strong>

            ${nome}
        `;


        div.appendChild(
            linha
        );

    }


    escala.appendChild(
        div
    );

}


// ========================================
// GERAR LEMBRETE
// ========================================

function gerarLembrete(
    data,
    auditorio,
    microfone,
    video
) {

    let texto = `
        <strong>
            🔔 ESCALA — ${data}
        </strong>

        <br><br>
    `;


    texto +=
        montarTextoLembrete(
            "🎤 AUDITÓRIO",
            [
                "Entrada",
                "Auditório",
                "Substituto"
            ],
            auditorio
        );


    texto +=
        montarTextoLembrete(
            "🎙️ MICROFONE",
            [
                "Microfone A",
                "Microfone B",
                "Substituto"
            ],
            microfone
        );


    texto +=
        montarTextoLembrete(
            "🎥 VÍDEO",
            [
                "Vídeo",
                "Áudio",
                "Palco"
            ],
            video
        );


    lembrete.innerHTML =
        texto;

}


// ========================================
// TEXTO DO LEMBRETE
// ========================================

function montarTextoLembrete(
    titulo,
    funcoes,
    dados
) {

    if (!dados) {

        return `
            <br>

            <strong>
                ${titulo}
            </strong>

            <br>

            Data não encontrada.

            <br>
        `;

    }


    const nomes =
        dados.slice(1);


    let resultado = `
        <br>

        <strong>
            ${titulo}
        </strong>

        <br>
    `;


    for (
        let i = 0;
        i < funcoes.length;
        i++
    ) {

        resultado += `
            ${funcoes[i]}:
            ${nomes[i] || "Não encontrado"}

            <br>
        `;

    }


    return resultado;

}