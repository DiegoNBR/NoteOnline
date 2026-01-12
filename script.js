let produtos = [];

// Formatar telefone automaticamente
const telefonInput = document.getElementById("telefone");
if (telefonInput) {
    telefonInput.addEventListener("input", function(e) {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length <= 2) {
            e.target.value = value;
        } else if (value.length <= 7) {
            e.target.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else {
            e.target.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        }
    });
}

function adicionarProduto() {
    const nome = document.getElementById("produto").value;
    const valor = parseFloat(document.getElementById("valor").value);
    const quantidade = parseInt(document.getElementById("quantidade").value);

    if (!nome || isNaN(valor) || isNaN(quantidade)) {
        alert("Preencha todos os campos");
        return;
    }

    const total = valor * quantidade;

    produtos.push({ nome, valor, quantidade, total });

    atualizarTabela();
    calcularTotal();

    document.getElementById("produto").value = "";
    document.getElementById("valor").value = "";
    document.getElementById("quantidade").value = "";
}

function atualizarTabela() {
    const tbody = document.getElementById("listaProdutos");
    tbody.innerHTML = "";

    produtos.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${p.nome}</td>
            <td>R$ ${p.valor.toFixed(2)}</td>
            <td>${p.quantidade}</td>
            <td>R$ ${p.total.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function calcularTotal() {
    let total = produtos.reduce((soma, p) => soma + p.total, 0);
    const entrega = parseFloat(document.getElementById("entrega").value) || 0;
    total += entrega;

    document.getElementById("totalCompra").innerText = total.toFixed(2);
}

document.getElementById("entrega").addEventListener("input", calcularTotal);

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const logoSelecionada = document.querySelector('input[name="logo"]:checked');

    let y = 10;
    
    // Logo da loja (no canto superior direito)
    if (logoSelecionada && logoSelecionada.value) {
        const img = new Image();
        img.onload = function() {
            const tamanho = 20;
            const x = 180;
            // Adicionar imagem circular (jsPDF não tem clipping nativo, mas deixamos a imagem quadrada pequena)
            doc.addImage(img, 'JPEG', x, y, tamanho, tamanho);
            continuarPDF(doc, y);
        };
        img.src = logoSelecionada.value;
    } else {
        continuarPDF(doc, y);
    }
}

function continuarPDF(doc, y) {
    y += 3;
    
    // Cabeçalho
    doc.setFontSize(16);
    doc.text("NoteOn", 10, y);
    y += 8;
    
    // Informações do cliente
    const nomeCliente = document.getElementById("cliente").value || "Cliente não informado";
    const telefone = document.getElementById("telefone").value;
    const cpfCnpj = document.getElementById("cpfCnpj").value;
    const formaPagamento = document.getElementById("formaPagamento").value;
    const dataPagamento = document.getElementById("dataPagamento").value;
    
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`Cliente: ${nomeCliente}`, 10, y);
    y += 7;
    
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    if (telefone) {
        doc.text(`Telefone: ${telefone}`, 10, y);
        y += 6;
    }
    if (cpfCnpj) {
        doc.text(`CPF/CNPJ: ${cpfCnpj}`, 10, y);
        y += 6;
    }
    
    doc.text(`Data do Pedido: ${new Date().toLocaleDateString("pt-BR")}`, 10, y);
    y += 8;
    
    if (formaPagamento) {
        doc.setFont(undefined, "bold");
        doc.text(`Forma de Pagamento: ${formaPagamento}`, 10, y);
        y += 6;
        doc.setFont(undefined, "normal");
    }
    if (dataPagamento) {
        const dataFormatada = new Date(dataPagamento).toLocaleDateString("pt-BR");
        doc.text(`Data de Vencimento: ${dataFormatada}`, 10, y);
        y += 8;
    } else {
        y += 2;
    }
    
    y += 4;

    // Cabeçalho da tabela
    doc.setFillColor(200, 200, 200);
    doc.setFont(undefined, "bold");
    doc.rect(10, y - 5, 190, 7, "F");
    doc.text("Produto", 15, y);
    doc.text("Valor Unit.", 80, y);
    doc.text("Qtd", 130, y);
    doc.text("Total", 160, y);
    y += 10;

    // Dados da tabela
    doc.setFont(undefined, "normal");
    produtos.forEach(p => {
        doc.text(p.nome, 15, y);
        doc.text(`R$ ${p.valor.toFixed(2)}`, 80, y);
        doc.text(p.quantidade.toString(), 130, y);
        doc.text(`R$ ${p.total.toFixed(2)}`, 160, y);
        y += 8;
    });

    // Linha de separação
    y += 2;
    doc.line(10, y, 200, y);
    y += 8;

    // Resumo
    doc.setFont(undefined, "bold");
    const entrega = parseFloat(document.getElementById("entrega").value) || 0;
    const subtotal = produtos.reduce((sum, p) => sum + p.total, 0);
    const totalFinal = subtotal + entrega;

    doc.text("Subtotal:", 130, y);
    doc.text(`R$ ${subtotal.toFixed(2)}`, 160, y);
    y += 8;

    doc.text("Entrega:", 130, y);
    doc.text(`R$ ${entrega.toFixed(2)}`, 160, y);
    y += 8;

    doc.line(10, y - 4, 200, y - 4);
    doc.text("TOTAL:", 130, y);
    doc.setFontSize(12);
    doc.text(`R$ ${totalFinal.toFixed(2)}`, 160, y);

    return { doc, totalFinal, subtotal, entrega };
}

function gerarPDF() {
    const cliente = document.getElementById("cliente").value;
    if (!cliente || produtos.length === 0) {
        alert("Preencha o cliente e adicione produtos");
        return;
    }
    
    const resultado = criarDocumento();
    resultado.doc.save("recibo-noteon.pdf");
}

async function gerarDOCX() {
    const cliente = document.getElementById("cliente").value;
    if (!cliente || produtos.length === 0) {
        alert("Preencha o cliente e adicione produtos");
        return;
    }
    
    const telefone = document.getElementById("telefone").value;
    const cpfCnpj = document.getElementById("cpfCnpj").value;
    const formaPagamento = document.getElementById("formaPagamento").value;
    const dataPagamento = document.getElementById("dataPagamento").value;
    const entrega = parseFloat(document.getElementById("entrega").value) || 0;
    const subtotal = produtos.reduce((sum, p) => sum + p.total, 0);
    const totalFinal = subtotal + entrega;
    
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const dataVencimento = dataPagamento ? new Date(dataPagamento).toLocaleDateString("pt-BR") : "";
    
    // Construir conteúdo do documento
    let conteudo = `RECIBO NOTEON\n\n`;
    conteudo += `Cliente: ${cliente}\n`;
    if (telefone) conteudo += `Telefone: ${telefone}\n`;
    if (cpfCnpj) conteudo += `CPF/CNPJ: ${cpfCnpj}\n`;
    conteudo += `Data do Pedido: ${dataAtual}\n\n`;
    
    if (formaPagamento) conteudo += `Forma de Pagamento: ${formaPagamento}\n`;
    if (dataVencimento) conteudo += `Data de Vencimento: ${dataVencimento}\n`;
    conteudo += `\n--- PRODUTOS ---\n`;
    
    produtos.forEach(p => {
        conteudo += `${p.nome} - R$ ${p.valor.toFixed(2)} x ${p.quantidade} = R$ ${p.total.toFixed(2)}\n`;
    });
    
    conteudo += `\nSubtotal: R$ ${subtotal.toFixed(2)}\n`;
    conteudo += `Entrega: R$ ${entrega.toFixed(2)}\n`;
    conteudo += `TOTAL: R$ ${totalFinal.toFixed(2)}\n`;
    
    // Criar documento usando docx
    const doc = new docx.Document({
        sections: [{
            children: [
                new docx.Paragraph({
                    text: "RECIBO NOTEON",
                    heading: docx.HeadingLevel.HEADING_1,
                    spacing: { after: 200 }
                }),
                new docx.Paragraph({
                    text: `Cliente: ${cliente}`,
                    spacing: { after: 100 }
                }),
                ...(telefone ? [new docx.Paragraph({ text: `Telefone: ${telefone}`, spacing: { after: 100 } })] : []),
                ...(cpfCnpj ? [new docx.Paragraph({ text: `CPF/CNPJ: ${cpfCnpj}`, spacing: { after: 100 } })] : []),
                new docx.Paragraph({
                    text: `Data do Pedido: ${dataAtual}`,
                    spacing: { after: 200 }
                }),
                ...(formaPagamento ? [new docx.Paragraph({ text: `Forma de Pagamento: ${formaPagamento}`, spacing: { after: 100 } })] : []),
                ...(dataVencimento ? [new docx.Paragraph({ text: `Data de Vencimento: ${dataVencimento}`, spacing: { after: 200 } })] : []),
                new docx.Paragraph({
                    text: "PRODUTOS",
                    heading: docx.HeadingLevel.HEADING_2,
                    spacing: { after: 100 }
                }),
                ...produtos.map(p => 
                    new docx.Paragraph({
                        text: `${p.nome} - R$ ${p.valor.toFixed(2)} x ${p.quantidade} = R$ ${p.total.toFixed(2)}`,
                        spacing: { after: 50 }
                    })
                ),
                new docx.Paragraph({
                    text: `Subtotal: R$ ${subtotal.toFixed(2)}`,
                    spacing: { after: 50 }
                }),
                new docx.Paragraph({
                    text: `Entrega: R$ ${entrega.toFixed(2)}`,
                    spacing: { after: 50 }
                }),
                new docx.Paragraph({
                    text: `TOTAL: R$ ${totalFinal.toFixed(2)}`,
                    spacing: { after: 100 },
                    bold: true,
                    size: 24
                })
            ]
        }]
    });
    
    docx.Packer.toBlob(doc).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recibo-noteon.docx";
        a.click();
        window.URL.revokeObjectURL(url);
    });
}

async function gerarIMG(formato) {
    const cliente = document.getElementById("cliente").value;
    if (!cliente || produtos.length === 0) {
        alert("Preencha o cliente e adicione produtos");
        return;
    }
    
    // Criar um elemento temporário para capturar
    const container = document.createElement("div");
    container.style.cssText = `
        background: white;
        color: #0f172a;
        padding: 30px;
        font-family: Arial, sans-serif;
        width: 600px;
        position: absolute;
        left: -9999px;
        top: -9999px;
    `;
    
    const telefone = document.getElementById("telefone").value;
    const cpfCnpj = document.getElementById("cpfCnpj").value;
    const formaPagamento = document.getElementById("formaPagamento").value;
    const dataPagamento = document.getElementById("dataPagamento").value;
    const entrega = parseFloat(document.getElementById("entrega").value) || 0;
    const subtotal = produtos.reduce((sum, p) => sum + p.total, 0);
    const totalFinal = subtotal + entrega;
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const dataVencimento = dataPagamento ? new Date(dataPagamento).toLocaleDateString("pt-BR") : "";
    
    container.innerHTML = `
        <h1 style="text-align: center; margin-bottom: 20px;">RECIBO NOTEON</h1>
        <p><strong>Cliente:</strong> ${cliente}</p>
        ${telefone ? `<p><strong>Telefone:</strong> ${telefone}</p>` : ''}
        ${cpfCnpj ? `<p><strong>CPF/CNPJ:</strong> ${cpfCnpj}</p>` : ''}
        <p><strong>Data do Pedido:</strong> ${dataAtual}</p>
        ${formaPagamento ? `<p><strong>Forma de Pagamento:</strong> ${formaPagamento}</p>` : ''}
        ${dataVencimento ? `<p><strong>Data de Vencimento:</strong> ${dataVencimento}</p>` : ''}
        
        <h2 style="margin-top: 20px; font-size: 16px;">PRODUTOS</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
            <thead>
                <tr style="border-bottom: 2px solid #000;">
                    <th style="text-align: left; padding: 8px;">Produto</th>
                    <th style="text-align: center; padding: 8px;">Qtd</th>
                    <th style="text-align: right; padding: 8px;">Valor Unit.</th>
                    <th style="text-align: right; padding: 8px;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${produtos.map(p => `
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px;">${p.nome}</td>
                        <td style="text-align: center; padding: 8px;">${p.quantidade}</td>
                        <td style="text-align: right; padding: 8px;">R$ ${p.valor.toFixed(2)}</td>
                        <td style="text-align: right; padding: 8px;">R$ ${p.total.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
            <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
            <p>Entrega: R$ ${entrega.toFixed(2)}</p>
            <p style="font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px;">TOTAL: R$ ${totalFinal.toFixed(2)}</p>
        </div>
    `;
    
    document.body.appendChild(container);
    
    try {
        const canvas = await html2canvas(container, {
            backgroundColor: "#ffffff",
            scale: 2
        });
        
        const link = document.createElement("a");
        canvas.toBlob(blob => {
            link.href = URL.createObjectURL(blob);
            link.download = `recibo-noteon.${formato}`;
            link.click();
        }, `image/${formato}`);
    } catch (error) {
        console.error("Erro ao gerar imagem:", error);
        alert("Erro ao gerar imagem");
    } finally {
        document.body.removeChild(container);
    }
}

function finalizarCompra() {
    const cliente = document.getElementById("cliente").value;
    if (!cliente || produtos.length === 0) {
        alert("Preencha o cliente e adicione produtos");
        return;
    }
    alert("Selecione o formato de exportação acima para finalizar a compra");
}
