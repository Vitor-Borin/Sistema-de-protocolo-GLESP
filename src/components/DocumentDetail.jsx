import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ChevronLeft, Printer, Edit, Trash2, Share2, MessageCircle, Mail, Copy, Check, Download, FileImage } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '../contexts/ToastContext';

const DetailItem = React.memo(({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</p>
        <p className="text-md text-gray-900 dark:text-white font-medium">{value || '-'}</p>
    </div>
));

const DocumentDetail = React.memo(({ doc, documentTypes, onBack, onDelete, onEdit, onPrint }) => {
    if (!doc) return null;

    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const shareMenuRef = useRef(null);
    const { addToast } = useToast();

    const docType = useMemo(() => 
        documentTypes.find(t => t.id === doc.typeId), 
        [documentTypes, doc.typeId]
    );

    // Fechar menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
                setShowShareMenu(false);
            }
        };

        if (showShareMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showShareMenu]);
    
    const protocolDate = useMemo(() => {
        // Log removido para otimização
        
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
            return 'Data Indisponível';
        }
    }, [doc.createdAt]);

    // Função para formatar o texto do protocolo
    const getProtocolText = () => {
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

    // Compartilhar via WhatsApp (com PDF)
    const shareWhatsApp = async () => {
        try {
            addToast({ message: '🔄 Gerando PDF...', type: 'info' });
            
            // Primeiro gera o PDF
            await downloadAsPDF();
            setShowShareMenu(false);
            
            addToast({ message: '✅ PDF gerado! Abrindo WhatsApp...', type: 'success' });
            
            // Depois tenta abrir o WhatsApp
            const text = `*COMPROVANTE DE PROTOCOLO GLESP*\n\n` +
                        `*Protocolo:* ${doc.docNumber}\n` +
                        `*Data:* ${protocolDate}\n` +
                        `*Tipo:* ${documentTypes.find(t => t.id === doc.typeId)?.name || 'Não definido'}\n\n` +
                        `Sistema de Protocolos GLESP`;
            
            const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
        } catch (error) {
            addToast({ message: '❌ Erro ao compartilhar via WhatsApp', type: 'error' });
        }
    };

    // Compartilhar via Email (com PDF)
    const shareEmail = async () => {
        try {
            addToast({ message: '🔄 Gerando PDF...', type: 'info' });
            
            // Primeiro gera o PDF
            await downloadAsPDF();
            setShowShareMenu(false);
            
            addToast({ message: '✅ PDF gerado! Abrindo email...', type: 'success' });
            
            // Depois abre o email
            const subject = `Comprovante de Protocolo ${doc.docNumber} - GLESP`;
            const body = `Prezado(a),\n\n` +
                        `Segue em anexo o comprovante de protocolo:\n\n` +
                        `📌 Protocolo: ${doc.docNumber}\n` +
                        `📅 Data: ${protocolDate}\n` +
                        `📄 Tipo: ${documentTypes.find(t => t.id === doc.typeId)?.name || 'Não definido'}\n\n` +
                        `Atenciosamente,\n` +
                        `Sistema de Protocolos GLESP`;
            
            const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;
        } catch (error) {
            addToast({ message: '❌ Erro ao compartilhar via Email', type: 'error' });
        }
    };

    // Copiar informações
    const copyToClipboard = async () => {
        const text = getProtocolText();
        try {
            addToast({ message: '🔄 Copiando texto...', type: 'info' });
            await navigator.clipboard.writeText(text);
            setCopied(true);
            addToast({ message: '✅ Texto copiado para a área de transferência!', type: 'success' });
            setTimeout(() => {
                setCopied(false);
                setShowShareMenu(false);
            }, 2000);
        } catch (err) {
            addToast({ message: '❌ Erro ao copiar texto', type: 'error' });
        }
    };

    // Download como PDF (usando a mesma lógica do ReceiptModal)
    const downloadAsPDF = async () => {
        try {
            addToast({ message: '🔄 Gerando PDF...', type: 'info' });
            
            // Criar elemento temporário com CSS puro (sem Tailwind)
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
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
                imageTimeout: 0
            });
            
            document.body.removeChild(tempDiv);
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = 210;
            const pageHeight = 297;
            const imgWidth = 180;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const xOffset = (pageWidth - imgWidth) / 2;
            const yOffset = (pageHeight - imgHeight) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
            pdf.save(`Comprovante_${doc.docNumber}.pdf`);
            
            addToast({ message: '✅ PDF baixado com sucesso!', type: 'success' });
            setShowShareMenu(false);
        } catch (error) {
            addToast({ message: '❌ Erro ao gerar PDF. Tente novamente.', type: 'error' });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <button 
                    onClick={onBack}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 sm:mb-0 transition-colors duration-200"
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span>Voltar para a lista</span>
                </button>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Botão Compartilhar com Dropdown */}
                    <div className="relative" ref={shareMenuRef}>
                        <button 
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                        >
                            <Share2 className="h-4 w-4" />
                            <span>Compartilhar</span>
                        </button>

                        {/* Menu Dropdown de Compartilhamento */}
                        {showShareMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                                <div className="py-1">
                                    <button
                                        onClick={shareWhatsApp}
                                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                    >
                                        <MessageCircle className="h-4 w-4 text-green-600" />
                                        <span>WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={shareEmail}
                                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    >
                                        <Mail className="h-4 w-4 text-blue-600" />
                                        <span>Email</span>
                                    </button>
                                    <button
                                        onClick={copyToClipboard}
                                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                                        <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                                    </button>
                                    <button
                                        onClick={downloadAsPDF}
                                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <FileImage className="h-4 w-4 text-red-600" />
                                        <span>Baixar PDF</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                     <button 
                        onClick={() => onPrint(doc)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Imprimir</span>
                    </button>
                    <button 
                        onClick={() => onEdit(doc)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                    </button>
                    <button 
                        onClick={() => onDelete(doc.id)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Excluir</span>
                    </button>
                </div>
            </div>

            {/* Título Principal */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{docType ? docType.name : "Tipo Desconhecido"}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-mono">{doc.docNumber}</p>
            </div>
            
            {/* Detalhes */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <DetailItem label="Data e Hora do Protocolo" value={protocolDate} />
                <DetailItem label="Quantidade" value={doc.quantity} />
                <DetailItem label="Nº da Loja" value={doc.shopNumber} />
                <DetailItem label="Entregue por" value={doc.deliveredBy} />
                <DetailItem label="Protocolado por" value={doc.protocolledBy} />
                <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Descrição / Observações</p>
                    <p className="text-md text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[80px]">
                        {doc.description || '-'}
                    </p>
                </div>
            </div>
        </div>
    );
});

export default DocumentDetail;
