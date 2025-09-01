"use client"
import { GlespLogo } from "./GlespLogo"
import { X, Printer } from "lucide-react"

export default function ReceiptModal({ doc, onClose, documentTypes }) {
  if (!doc) return null

  const printReceipt = () => {
    window.print()
  }

  const docType = documentTypes.find((t) => t.id === doc.typeId)
  const protocolDate = doc.createdAt
    ? new Date(doc.createdAt.seconds * 1000).toLocaleString("pt-BR")
    : "Data Indisponível"

  const DetailRow = ({ label, value }) => (
    <div className="flex justify-between py-4 border-b border-border/50">
      <span className="text-sm font-semibold text-muted-foreground">{label}:</span>
      <span className="text-sm text-card-foreground text-right font-medium">{value}</span>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/60 backdrop-blur-sm animate-scale-in">
      <div className="bg-popover border border-border rounded-2xl shadow-2xl w-full max-w-md relative printable-area">
        <div className="absolute top-6 right-6 print:hidden">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-full hover:bg-muted p-2 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8 border-b border-border pb-6">
            <GlespLogo className="mx-auto h-20 w-auto mb-4" />
            <h2 className="text-2xl font-bold text-popover-foreground mb-2">Comprovante de Protocolo</h2>
            <p className="text-sm text-muted-foreground">Grande Loja Maçônica do Estado de São Paulo</p>
          </div>

          <div className="space-y-1">
            <DetailRow
              label="Nº do Protocolo"
              value={
                <span className="font-mono bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-bold">
                  {doc.docNumber}
                </span>
              }
            />
            <DetailRow label="Data e Hora" value={protocolDate} />
            <DetailRow label="Tipo do Documento" value={docType?.name || "Não definido"} />
            <DetailRow label="Nº da Loja" value={doc.shopNumber} />
            <DetailRow label="Entregue por" value={doc.deliveredBy} />
            <DetailRow label="Quantidade" value={doc.quantity} />
            <DetailRow label="Protocolado por" value={doc.protocolledBy} />
          </div>

          <div className="mt-16 text-center">
            <div className="w-4/5 h-px bg-border mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-3 font-medium">Assinatura do Recebedor</p>
          </div>
        </div>

        <div className="p-6 bg-muted/30 rounded-b-2xl flex justify-center print:hidden border-t border-border">
          <button
            onClick={printReceipt}
            className="flex items-center space-x-2 w-full justify-center px-6 py-3 text-sm font-medium rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-200"
          >
            <Printer className="h-5 w-5" />
            <span>Imprimir Comprovante</span>
          </button>
        </div>
      </div>
    </div>
  )
}
