/*
 * ---
 * Projeto: Gerador de HTML a partir de Markdown (CLI)
 * Descrição: Este script converte um arquivo de texto com sintaxe básica de Markdown
 *            (.md) para um arquivo HTML estilizado. Suporta cabeçalhos (h1-h6),
 *            negrito, itálico, links e listas não ordenadas.
 * Bibliotecas necessárias: Nenhuma. Utiliza apenas os módulos 'fs' e 'path'
 *                        nativos do Node.js.
 * Como executar: node main.js <caminho_para_o_arquivo.md>
 * Exemplo: node main.js meu-post.md
 *          (Isso irá gerar um arquivo 'meu-post.html' no mesmo diretório)
 * ---
 */

const fs = require('fs');
const path = require('path');

/**
 * Converte uma string de texto em Markdown para uma string de HTML.
 * @param {string} markdownText - O conteúdo do arquivo Markdown.
 * @returns {string} - O conteúdo convertido para HTML.
 */
function convertMarkdownToHtml(markdownText) {
    let html = markdownText
        // Cabeçalhos (h1 a h6)
        .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
        .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')

        // Negrito (**texto** ou __texto__)
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/__(.*?)__/gim, '<strong>$1</strong>')

        // Itálico (*texto* ou _texto_)
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/_(.*?)_/gim, '<em>$1</em>')

        // Links [texto](url)
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
        
        // Listas não ordenadas (*, +, ou -)
        .replace(/^\s*[-*+]\s+(.*)/gim, '<li>$1</li>');

    // Agrupa itens de lista consecutivos em uma tag <ul>
    html = html.replace(/<\/li>\n<li>/gim, '</li><li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>\n$1\n</ul>');

    // Parágrafos (qualquer linha que não comece com uma tag HTML)
    html = html.split('\n').map(line => {
        if (line.trim() === '' || line.trim().startsWith('<h') || line.trim().startsWith('<ul') || line.trim().startsWith('<li') || line.trim().startsWith('</ul')) {
            return line;
        }
        return `<p>${line.trim()}</p>`;
    }).join('\n');
    
    // Remove múltiplos blocos <ul> adjacentes
    html = html.replace(/<\/ul>\n<ul>/gim, '');

    return html;
}

/**
 * Gera um documento HTML completo com estilos básicos.
 * @param {string} title - O título da página.
 * @param {string} bodyContent - O conteúdo HTML do corpo da página.
 * @returns {string} - A string completa do documento HTML.
 */
function createFullHtmlDocument(title, bodyContent) {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 10px;
        }
        p {
            margin-bottom: 15px;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        strong {
            font-weight: bold;
        }
        em {
            font-style: italic;
        }
    </style>
</head>
<body>
    ${bodyContent}
</body>
</html>`;
}

/**
 * Função principal que executa o script.
 */
function main() {
    const args = process.argv.slice(2);

    if (args.length !== 1) {
        console.error("Uso: node main.js <arquivo.md>");
        process.exit(1);
    }

    const inputFile = args[0];

    if (path.extname(inputFile) !== '.md') {
        console.error("Erro: O arquivo de entrada deve ter a extensão '.md'.");
        process.exit(1);
    }

    if (!fs.existsSync(inputFile)) {
        console.error(`Erro: O arquivo "${inputFile}" não foi encontrado.`);
        process.exit(1);
    }

    try {
        const markdownContent = fs.readFileSync(inputFile, 'utf-8');
        const bodyHtml = convertMarkdownToHtml(markdownContent);
        
        const title = path.basename(inputFile, '.md');
        const fullHtml = createFullHtmlDocument(title, bodyHtml);
        
        const outputFile = path.join(path.dirname(inputFile), `${title}.html`);
        fs.writeFileSync(outputFile, fullHtml);

        console.log(`Sucesso! Arquivo "${outputFile}" gerado.`);
    } catch (error) {
        console.error("Ocorreu um erro durante o processamento do arquivo:", error.message);
        process.exit(1);
    }
}

// Inicia a execução do script
main();