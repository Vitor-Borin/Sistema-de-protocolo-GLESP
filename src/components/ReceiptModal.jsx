import React, { useState, useRef } from 'react';
import { GlespLogo } from './GlespLogo';
import { X, Printer, MessageCircle, Mail, Copy, Check, Download, FileImage } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ReceiptModal({ doc, onClose, documentTypes }) {
    if (!doc) return null;

    const { showSuccess, showError } = useToast();
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const receiptRef = useRef(null);

    // Função para formatar o texto do protocolo
    const getProtocolText = () => {
        const docType = documentTypes.find(t => t.id === doc.typeId);
        const protocolDate = (() => {
            if (!doc || !doc.createdAt) return 'Data Indisponível';
            try {
                if (doc.createdAt && typeof doc.createdAt === 'object' && doc.createdAt.seconds !== undefined) {
                    return new Date(doc.createdAt.seconds * 1000).toLocaleString('pt-BR');
                }
                if (doc.createdAt instanceof Date) {
                    return doc.createdAt.toLocaleString('pt-BR');
                }
                return 'Data Indisponível';
            } catch (error) {
                return 'Data Indisponível';
            }
        })();

        return `📋 *COMPROVANTE DE PROTOCOLO*\n\n` +
               `🏛️ *Grande Loja Maçônica do Estado de São Paulo*\n\n` +
               `━━━━━━━━━━━━━━━━━━━━━\n\n` +
               `📌 *Nº do Protocolo:* ${doc.docNumber}\n` +
               `📅 *Data e Hora:* ${protocolDate}\n` +
               `📄 *Tipo de Documento:* ${docType?.name || 'Não definido'}\n` +
               `🏢 *Nº da Loja:* ${doc.shopNumber}\n` +
               `👤 *Entregue por:* ${doc.deliveredBy}\n` +
               `📦 *Quantidade:* ${doc.quantity}\n` +
               `✍️ *Protocolado por:* ${doc.protocolledBy}\n\n` +
               `━━━━━━━━━━━━━━━━━━━━━\n\n` +
               `Este documento comprova o recebimento do protocolo acima descrito.\n\n` +
               `Sistema de Protocolos GLESP`;
    };

    // Compartilhar via WhatsApp
    const shareWhatsApp = () => {
        const text = getProtocolText();
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        showSuccess('WhatsApp aberto!', 'Agora você pode escolher o contato para enviar.');
    };

    // Compartilhar via Email
    const shareEmail = () => {
        const docType = documentTypes.find(t => t.id === doc.typeId);
        const subject = `Comprovante de Protocolo ${doc.docNumber} - GLESP`;
        const body = getProtocolText();
        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
        showSuccess('Email aberto!', 'Preencha o destinatário e envie.');
    };

    // Copiar informações
    const copyToClipboard = async () => {
        const text = getProtocolText();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            showSuccess('Copiado!', 'Informações do protocolo copiadas para a área de transferência.');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            showError('Erro', 'Não foi possível copiar. Tente novamente.');
        }
    };

    // Download como texto (removido - apenas PDF agora)

    // Gerar imagem do comprovante
    const generateImage = async () => {
        try {
            setGenerating(true);
            
            const docType = documentTypes.find(t => t.id === doc.typeId);
            const protocolDate = (() => {
                if (!doc || !doc.createdAt) return 'Data Indisponível';
                try {
                    if (doc.createdAt && typeof doc.createdAt === 'object' && doc.createdAt.seconds !== undefined) {
                        return new Date(doc.createdAt.seconds * 1000).toLocaleString('pt-BR');
                    }
                    if (doc.createdAt instanceof Date) {
                        return doc.createdAt.toLocaleString('pt-BR');
                    }
                    return 'Data Indisponível';
                } catch (error) {
                    return 'Data Indisponível';
                }
            })();

            // Criar elemento temporário com CSS puro (sem Tailwind)
            const tempDiv = document.createElement('div');
            tempDiv.style.cssText = `
                width: 700px;
                padding: 20px;
                background: white;
                font-family: Arial, sans-serif;
                position: absolute;
                left: -9999px;
                top: 0;
            `;
            
            tempDiv.innerHTML = `
                <div style="border: 2px solid #000; padding: 20px; background: white;">
                    <!-- Cabeçalho -->
                    <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #000;">
                        <div style="margin-bottom: 15px;">
                            <div style="width: 80px; height: 80px; margin: 0 auto 10px; background: white; display: flex; align-items: center; justify-content: center; border-radius: 12px;">
                                <img src="/brasao-glesp.png" alt="GLESP" style="width: 100%; height: 100%; object-fit: contain;" />
                            </div>
                        </div>
                        <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase;">
                            Comprovante de Protocolo
                        </div>
                        <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
                            Grande Loja Maçônica do Estado de São Paulo
                        </div>
                        <div style="display: inline-block; background: #f0f0f0; border: 1px solid #333; padding: 5px 15px; border-radius: 15px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                            VIA DA LOJA
                        </div>
                    </div>
                    
                    <!-- Detalhes -->
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #333;">
                        <tr style="background: #e9ecef;">
                            <td style="width: 40%; padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold; border-right: 1px solid #ddd;">
                                Nº do Protocolo:
                            </td>
                            <td style="width: 60%; padding: 12px; border-bottom: 1px solid #ddd;">
                                <span style="background: #fff3cd; padding: 4px 8px; border-radius: 3px; font-family: monospace; font-weight: bold; color: #856404;">
                                    ${doc.docNumber}
                                </span>
                            </td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold; background: #e9ecef; border-right: 1px solid #ddd;">
                                Data e Hora:
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #ddd;">
                                ${protocolDate}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold; background: #e9ecef; border-right: 1px solid #ddd;">
                                Tipo do Documento:
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #ddd; background: #f8f9fa;">
                                ${docType?.name || 'Não definido'}
                            </td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold; background: #e9ecef; border-right: 1px solid #ddd;">
                                Nº da Loja:
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #ddd;">
                                ${doc.shopNumber}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold; background: #e9ecef; border-right: 1px solid #ddd;">
                                Entregue por:
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #ddd; background: #f8f9fa;">
                                ${doc.deliveredBy}
                            </td>
                        </tr>
                        <tr style="background: #f8f9fa;">
                            <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: bold; background: #e9ecef; border-right: 1px solid #ddd;">
                                Quantidade:
                            </td>
                            <td style="padding: 12px; border-bottom: 1px solid #ddd;">
                                ${doc.quantity}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; font-weight: bold; background: #e9ecef; border-right: 1px solid #ddd;">
                                Protocolado por:
                            </td>
                            <td style="padding: 12px; background: #f8f9fa;">
                                ${doc.protocolledBy}
                            </td>
                        </tr>
                    </table>
                    
                    <!-- Assinatura -->
                    <div style="margin-top: 30px; padding: 20px; background: white; display: flex; justify-content: space-between; min-height: 80px;">
                        <div style="flex: 2; text-align: center; padding: 10px;">
                            <div style="width: 250px; height: 1px; border-bottom: 1px solid #333; margin: 40px auto 8px;"></div>
                            <div style="font-size: 10px; color: #333; text-transform: uppercase; letter-spacing: 0.5px;">
                                Assinatura do Recebedor
                            </div>
                        </div>
                        <div style="flex: 1; text-align: center; padding: 10px 0 10px 15px;">
                            <div style="font-size: 10px; color: #333; margin-bottom: 20px;">Data:</div>
                            <div style="font-size: 10px; color: #333;">____/____/____</div>
                        </div>
                    </div>
                    
                    <!-- Rodapé -->
                    <div style="text-align: center; font-size: 10px; color: #666; margin-top: 15px; border-top: 1px solid #ddd; padding-top: 10px; font-style: italic;">
                        Este documento comprova o recebimento do protocolo acima descrito
                    </div>
                </div>
            `;
            
            document.body.appendChild(tempDiv);
            
            // Aguardar carregamento da imagem
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
                imageTimeout: 0
            });
            
            document.body.removeChild(tempDiv);
            setGenerating(false);
            return canvas;
        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
            setGenerating(false);
            showError('Erro', 'Não foi possível gerar a imagem do comprovante.');
            return null;
        }
    };

    // Baixar como imagem PNG
    const downloadAsImage = async () => {
        const canvas = await generateImage();
        if (!canvas) return;

        try {
            canvas.toBlob((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Comprovante_${doc.docNumber}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                showSuccess('Download concluído!', `Imagem ${doc.docNumber}.png baixada com sucesso.`);
            });
        } catch (error) {
            console.error('Erro ao baixar imagem:', error);
            showError('Erro', 'Não foi possível baixar a imagem.');
        }
    };

    // Baixar como PDF
    const downloadAsPDF = async () => {
        const canvas = await generateImage();
        if (!canvas) return;

        try {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgWidth = 180; // Largura da imagem (deixando margens)
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Centralizar horizontalmente
            const xOffset = (pageWidth - imgWidth) / 2;
            // Centralizar verticalmente
            const yOffset = (pageHeight - imgHeight) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
            pdf.save(`Comprovante_${doc.docNumber}.pdf`);
            
            showSuccess('Download concluído!', `PDF ${doc.docNumber}.pdf baixado com sucesso.`);
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            showError('Erro', 'Não foi possível gerar o PDF.');
        }
    };

    // Compartilhar imagem via WhatsApp (usando URL da imagem)
    const shareWhatsAppImage = async () => {
        const canvas = await generateImage();
        if (!canvas) return;

        try {
            // Converter canvas para blob
            canvas.toBlob(async (blob) => {
                if (!blob) return;

                // Tentar usar Web Share API se disponível (especialmente em mobile)
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'comprovante.png', { type: 'image/png' })] })) {
                    try {
                        const file = new File([blob], `Comprovante_${doc.docNumber}.png`, { type: 'image/png' });
                        await navigator.share({
                            title: `Comprovante de Protocolo ${doc.docNumber}`,
                            text: `Comprovante de Protocolo ${doc.docNumber} - GLESP`,
                            files: [file]
                        });
                        showSuccess('Compartilhado!', 'Comprovante compartilhado com sucesso.');
                    } catch (error) {
                        if (error.name !== 'AbortError') {
                            console.error('Erro ao compartilhar:', error);
                            // Fallback para texto
                            shareWhatsApp();
                        }
                    }
                } else {
                    // Fallback: compartilhar via WhatsApp Web com texto e dica para download
                    const text = getProtocolText() + '\n\n💡 *Dica:* Você também pode baixar o comprovante como imagem usando o botão "Baixar Imagem" no sistema.';
                    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                    showSuccess('WhatsApp aberto!', 'Download a imagem separadamente e anexe no WhatsApp.');
                }
            }, 'image/png');
        } catch (error) {
            console.error('Erro:', error);
            // Fallback para texto
            shareWhatsApp();
        }
    };

    // Compartilhar via Email com imagem
    const shareEmailImage = async () => {
        const canvas = await generateImage();
        if (!canvas) return;

        try {
            // Converter para base64
            const imgData = canvas.toDataURL('image/png');
            
            // Em navegadores modernos, podemos anexar via Web Share API
            if (navigator.share) {
                canvas.toBlob(async (blob) => {
                    if (!blob) return;
                    
                    try {
                        const file = new File([blob], `Comprovante_${doc.docNumber}.png`, { type: 'image/png' });
                        await navigator.share({
                            title: `Comprovante de Protocolo ${doc.docNumber} - GLESP`,
                            text: getProtocolText(),
                            files: [file]
                        });
                        showSuccess('Compartilhado!', 'Escolha o aplicativo de email.');
                    } catch (error) {
                        if (error.name !== 'AbortError') {
                            // Fallback para email com texto
                            shareEmail();
                        }
                    }
                }, 'image/png');
            } else {
                // Fallback: abrir email com texto
                shareEmail();
                showSuccess('Email aberto!', 'Baixe a imagem separadamente e anexe ao email.');
            }
        } catch (error) {
            console.error('Erro:', error);
            shareEmail();
        }
    };

    const printReceipt = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        
        const docType = documentTypes.find(t => t.id === doc.typeId);
        const protocolDate = (() => {
            console.log('ReceiptModal print - doc.createdAt:', doc.createdAt);
            
            if (!doc || !doc.createdAt) return 'Data Indisponível';
            
            try {
                // Se é um timestamp do Firestore (tem propriedade seconds)
                if (doc.createdAt && typeof doc.createdAt === 'object' && doc.createdAt.seconds !== undefined) {
                    return new Date(doc.createdAt.seconds * 1000).toLocaleString('pt-BR');
                }
                // Se é um objeto Date
                if (doc.createdAt instanceof Date) {
                    return doc.createdAt.toLocaleString('pt-BR');
                }
                // Fallback
                return 'Data Indisponível';
            } catch (error) {
                console.error('Erro ao formatar data:', error);
                return 'Data Indisponível';
            }
        })();
        
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
                        margin: 0 auto 10px;
                        background: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        color: #333;
                        padding: 5px;
                        box-sizing: border-box;
                        border-radius: 12px;
                        overflow: hidden;
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
                            <div class="logo-box">
                                <img src="/brasao-glesp.png" alt="GLESP Logo" style="
                                    width: 100%;
                                    height: 100%;
                                    object-fit: contain;
                                " />
                            </div>
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
                                <img src="/brasao-glesp.png" alt="GLESP Logo" style="
                                    width: 100%;
                                    height: 100%;
                                    object-fit: contain;
                                " />
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
    const protocolDate = (() => {
        console.log('ReceiptModal modal - doc.createdAt:', doc.createdAt);
        
        if (!doc || !doc.createdAt) return 'Data Indisponível';
        
        try {
            // Se é um timestamp do Firestore (tem propriedade seconds)
            if (doc.createdAt && typeof doc.createdAt === 'object' && doc.createdAt.seconds !== undefined) {
                return new Date(doc.createdAt.seconds * 1000).toLocaleString('pt-BR');
            }
            // Se é um objeto Date
            if (doc.createdAt instanceof Date) {
                return doc.createdAt.toLocaleString('pt-BR');
            }
            // Fallback
            return 'Data Indisponível';
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return 'Data Indisponível';
        }
    })();
    
    const DetailRow = ({ label, value }) => (
        <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-500">{label}:</span>
            <span className="text-sm text-gray-800 dark:text-white text-right">{value}</span>
        </div>
    );

    const ReceiptCopy = ({ title, subtitle, isSecondCopy = false }) => (
        <div className={`bg-white dark:bg-[var(--bg-card)] receipt-copy ${isSecondCopy ? 'second-copy border-t-2 border-dashed border-gray-400' : ''}`}>
            <div className="p-6">
                <div className="text-center mb-4 border-b border-gray-200 dark:border-gray-600 pb-4">
                    <GlespLogo className="mx-auto h-16 w-auto" />
                    <h2 className="mt-3 text-lg font-bold text-gray-800 dark:text-white">{title}</h2>
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
                <div ref={receiptRef} className="printable-area max-h-[80vh] overflow-y-auto">
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

                {/* Botão de Impressão */}
                <div className="p-6 bg-gray-50 dark:bg-[var(--bg-secondary)] rounded-b-xl print:hidden">
                    <button
                        onClick={printReceipt}
                        className="flex items-center space-x-2 w-full justify-center px-6 py-3 text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 transition-all duration-200 hover:shadow-xl hover:scale-105"
                    >
                        <Printer className="h-5 w-5" />
                        <span>Imprimir Comprovantes (2 vias)</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
