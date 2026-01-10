let produtos = [];

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
    doc.text("NoteOn - Notas Online", 10, y);
    y += 8;
    
    // Nome do cliente
    const nomeCliente = document.getElementById("cliente").value || "Cliente não informado";
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`Cliente: ${nomeCliente}`, 10, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 10, y);
    y += 12;

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

    doc.save("recibo-noteon.pdf");
}
