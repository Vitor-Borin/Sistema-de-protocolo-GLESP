import React from 'react';
import { GlespLogo } from './GlespLogo';
import { X, Printer } from 'lucide-react';

export default function ReceiptModal({ doc, onClose, documentTypes }) {
    if (!doc) return null;

    const printReceipt = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        
        const docType = documentTypes.find(t => t.id === doc.typeId);
        const protocolDate = doc.createdAt ? new Date(doc.createdAt.seconds * 1000).toLocaleString('pt-BR') : 'Data Indisponível';
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Comprovantes de Protocolo - ${doc.docNumber}</title>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: white;
                    }
                    
                    .receipt-copy {
                        border: 2px solid #000;
                        padding: 20px;
                        margin-bottom: 20px;
                        background: white;
                        width: 100%;
                        max-width: 700px;
                        margin-left: auto;
                        margin-right: auto;
                        box-sizing: border-box;
                    }
                    
                    .receipt-copy.second-copy {
                        border: 2px dashed #333;
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                        border-bottom: 2px solid #000;
                    }
                    
                    .logo-area {
                        margin-bottom: 15px;
                    }
                    
                    .logo-box {
                        width: 80px;
                        height: 80px;
                        border: 2px solid #333;
                        margin: 0 auto 10px;
                        background: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        color: #333;
                        padding: 5px;
                        box-sizing: border-box;
                    }
                    
                    .logo-box img {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                    }
                    
                    .title {
                        font-size: 20px;
                        font-weight: bold;
                        margin-bottom: 8px;
                        text-transform: uppercase;
                    }
                    
                    .organization {
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 10px;
                    }
                    
                    .via-label {
                        display: inline-block;
                        background: #f0f0f0;
                        border: 1px solid #333;
                        padding: 5px 15px;
                        border-radius: 15px;
                        font-size: 12px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    
                    .details-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                        border: 1px solid #333;
                    }
                    
                    .details-table td {
                        padding: 12px;
                        border-bottom: 1px solid #ddd;
                    }
                    
                    .details-table tr:nth-child(even) {
                        background: #f8f9fa;
                    }
                    
                    .details-table tr:last-child td {
                        border-bottom: none;
                    }
                    
                    .detail-label {
                        width: 40%;
                        font-weight: bold;
                        background: #e9ecef;
                        border-right: 1px solid #ddd;
                    }
                    
                    .detail-value {
                        width: 60%;
                    }
                    
                    .protocol-number {
                        background: #fff3cd;
                        padding: 4px 8px;
                        border-radius: 3px;
                        font-family: monospace;
                        font-weight: bold;
                        color: #856404;
                    }
                    
                    .signature-area {
                        margin-top: 30px;
                        padding: 20px;
                        border: 1px solid #333;
                        background: white;
                        display: flex;
                        justify-content: space-between;
                        min-height: 80px;
                    }
                    
                    .signature-left {
                        flex: 2;
                        text-align: center;
                        padding: 10px;
                    }
                    
                    .signature-line {
                        width: 250px;
                        height: 1px;
                        border-bottom: 1px solid #333;
                        margin: 40px auto 8px;
                    }
                    
                    .signature-text {
                        font-size: 10px;
                        color: #333;
                        font-weight: normal;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .signature-right {
                        flex: 1;
                        text-align: center;
                        border-left: 1px solid #ddd;
                        padding: 10px 0 10px 15px;
                    }
                    
                    .date-line {
                        width: 100px;
                        height: 1px;
                        border-bottom: 1px solid #333;
                        margin: 20px auto 8px;
                    }
                    
                    .date-text {
                        font-size: 10px;
                        color: #333;
                        font-weight: normal;
                    }
                    
                    .document-info {
                        text-align: center;
                        font-size: 10px;
                        color: #666;
                        margin-top: 15px;
                        border-top: 1px solid #ddd;
                        padding-top: 10px;
                        font-style: italic;
                    }
                    
                    .page-break {
                        page-break-before: always;
                        page-break-after: always;
                        display: block;
                        height: 1px;
                        width: 100%;
                    }
                    
                    @media print {
                        body { 
                            padding: 0; 
                            margin: 0;
                        }
                        .receipt-copy { 
                            max-width: none; 
                            margin: 0;
                            padding: 20px;
                            min-height: 90vh;
                            page-break-inside: avoid;
                        }
                        .page-break {
                            page-break-before: always !important;
                            page-break-after: auto !important;
                            height: 0 !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            border: none !important;
                            visibility: hidden !important;
                        }
                        @page {
                            margin: 15mm;
                            size: A4;
                        }
                    }
                </style>
            </head>
            <body>
                <!-- Primeira via -->
                <div class="receipt-copy">
                    <div class="header">
                        <div class="logo-area">
                            <div class="logo-box"><img src="/src/assets/brasao-glesp.png" alt="GLESP" /></div>
                        </div>
                        <div class="title">Comprovante de Protocolo</div>
                        <div class="organization">Grande Loja Maçônica do Estado de São Paulo</div>
                        <div class="via-label">VIA GLESP - ARQUIVO</div>
                    </div>
                    
                    <table class="details-table">
                        <tr>
                            <td class="detail-label">Nº do Protocolo:</td>
                            <td class="detail-value"><span class="protocol-number">${doc.docNumber}</span></td>
                        </tr>
                        <tr>
                            <td class="detail-label">Data e Hora:</td>
                            <td class="detail-value">${protocolDate}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Tipo do Documento:</td>
                            <td class="detail-value">${docType?.name || 'Não definido'}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Nº da Loja:</td>
                            <td class="detail-value">${doc.shopNumber}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Entregue por:</td>
                            <td class="detail-value">${doc.deliveredBy}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Quantidade:</td>
                            <td class="detail-value">${doc.quantity}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Protocolado por:</td>
                            <td class="detail-value">${doc.protocolledBy}</td>
                        </tr>
                    </table>
                    
                    <div class="signature-area">
                        <div class="signature-left">
                            <div class="signature-line"></div>
                            <div class="signature-text">Assinatura do Recebedor</div>
                        </div>
                        <div class="signature-right">
                            <div style="margin-bottom: 20px;">
                                <div class="date-text">Data:</div>
                            </div>
                            <div class="date-text">____/____/____</div>
                        </div>
                    </div>
                    
                    <div class="document-info">
                        Este documento comprova o recebimento do protocolo acima descrito
                    </div>
                </div>
                
                <!-- Quebra de página forçada -->
                <div class="page-break"></div>
                
                <!-- Segunda via -->
                <div class="receipt-copy second-copy">
                    <div class="header">
                        <div class="logo-area">
                            <div class="logo-box">
                                <img src="/src/assets/brasao-glesp.png" alt="GLESP" />
                            </div>
                        </div>
                        <div class="title">Comprovante de Protocolo</div>
                        <div class="organization">Grande Loja Maçônica do Estado de São Paulo</div>
                        <div class="via-label">VIA DA LOJA</div>
                    </div>
                    
                    <table class="details-table">
                        <tr>
                            <td class="detail-label">Nº do Protocolo:</td>
                            <td class="detail-value"><span class="protocol-number">${doc.docNumber}</span></td>
                        </tr>
                        <tr>
                            <td class="detail-label">Data e Hora:</td>
                            <td class="detail-value">${protocolDate}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Tipo do Documento:</td>
                            <td class="detail-value">${docType?.name || 'Não definido'}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Nº da Loja:</td>
                            <td class="detail-value">${doc.shopNumber}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Entregue por:</td>
                            <td class="detail-value">${doc.deliveredBy}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Quantidade:</td>
                            <td class="detail-value">${doc.quantity}</td>
                        </tr>
                        <tr>
                            <td class="detail-label">Protocolado por:</td>
                            <td class="detail-value">${doc.protocolledBy}</td>
                        </tr>
                    </table>
                    
                    <div class="signature-area">
                        <div class="signature-left">
                            <div class="signature-line"></div>
                            <div class="signature-text">Assinatura do Recebedor</div>
                        </div>
                        <div class="signature-right">
                            <div style="margin-bottom: 20px;">
                                <div class="date-text">Data:</div>
                            </div>
                            <div class="date-text">____/____/____</div>
                        </div>
                    </div>
                    
                    <div class="document-info">
                        Este documento comprova o recebimento do protocolo acima descrito
                    </div>
                </div>
                
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const docType = documentTypes.find(t => t.id === doc.typeId);
    const protocolDate = doc.createdAt ? new Date(doc.createdAt.seconds * 1000).toLocaleString('pt-BR') : 'Data Indisponível';
    
    const DetailRow = ({ label, value }) => (
        <div className="flex justify-between py-3 border-b border-gray-200 dark:border-[var(--border-primary)]">
            <span className="text-sm font-medium text-gray-500">{label}:</span>
            <span className="text-sm text-gray-800 dark:text-[var(--text-primary)] text-right">{value}</span>
        </div>
    );

    const ReceiptCopy = ({ title, subtitle, isSecondCopy = false }) => (
        <div className={`bg-white dark:bg-[var(--bg-card)] receipt-copy ${isSecondCopy ? 'second-copy border-t-2 border-dashed border-gray-400' : ''}`}>
            <div className="p-6">
                <div className="text-center mb-4 border-b border-gray-200 dark:border-[var(--border-primary)] pb-4">
                    <GlespLogo className="mx-auto h-16 w-auto" />
                    <h2 className="mt-3 text-lg font-bold text-gray-800 dark:text-[var(--text-primary)]">{title}</h2>
                    <p className="text-xs text-gray-500">Grande Loja Maçônica do Estado de São Paulo</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">{subtitle}</p>
                </div>

                <div className="space-y-1 text-sm">
                    <DetailRow label="Nº do Protocolo" value={<span className="font-mono bg-gray-100 dark:bg-[var(--bg-tertiary)] px-1 py-0.5 rounded text-xs">{doc.docNumber}</span>} />
                    <DetailRow label="Data e Hora" value={protocolDate} />
                    <DetailRow label="Tipo do Documento" value={docType?.name || 'Não definido'} />
                    <DetailRow label="Nº da Loja" value={doc.shopNumber} />
                    <DetailRow label="Entregue por" value={doc.deliveredBy} />
                    <DetailRow label="Quantidade" value={doc.quantity} />
                    <DetailRow label="Protocolado por" value={doc.protocolledBy} />
                </div>

                <div className="mt-8 text-center">
                    <div className="w-3/4 h-px bg-gray-300 mx-auto"></div>
                    <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] mt-1">Assinatura do Recebedor</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl shadow-2xl w-full max-w-lg relative my-8">
                <div className="absolute top-4 right-4 print:hidden z-10">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-[var(--text-secondary)] rounded-full hover:bg-gray-100 dark:hover:bg-[var(--bg-tertiary)] dark:bg-[var(--bg-tertiary)] p-1">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Área de impressão com duas vias */}
                <div className="printable-area max-h-[80vh] overflow-y-auto">
                    {/* Primeira via - Entrega */}
                    <ReceiptCopy 
                        title="Comprovante de Protocolo" 
                        subtitle="VIA DA LOJA"
                    />
                    
                    {/* Segunda via - Arquivo GLESP */}
                    <ReceiptCopy 
                        title="Comprovante de Protocolo" 
                        subtitle="VIA GLESP - ARQUIVO"
                        isSecondCopy={true}
                    />
                </div>

                <div className="p-6 bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-b-xl flex justify-center print:hidden">
                    <button
                        onClick={printReceipt}
                        className="
                            flex items-center space-x-2 w-full justify-center px-6 py-2.5 text-sm font-medium 
                            rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Printer className="h-5 w-5" />
                        <span>Imprimir Comprovantes (2 vias)</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
