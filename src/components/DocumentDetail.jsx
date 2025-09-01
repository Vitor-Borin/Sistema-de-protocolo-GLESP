"use client"
import { ChevronLeft, Printer, Edit, Trash2 } from "lucide-react"

export default function DocumentDetail({ doc, documentTypes, onBack, onDelete, onEdit, onPrint }) {
  if (!doc) return null

  const docType = documentTypes.find((t) => t.id === doc.typeId)
  const protocolDate = doc.createdAt
    ? new Date(doc.createdAt.seconds * 1000).toLocaleString("pt-BR")
    : "Data Indisponível"

  const DetailItem = ({ label, value }) => (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="text-base text-card-foreground bg-muted/30 px-4 py-3 rounded-lg border border-border/50">
        {value || "-"}
      </p>
    </div>
  )

  return (
    <div className="animate-fade-in-up">
      <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-border">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-4 sm:mb-0 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-muted/50"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Voltar para a lista</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onPrint(doc)}
              className="flex items-center space-x-2 px-4 py-2.5 border border-border text-sm font-medium rounded-xl text-card-foreground bg-card hover:bg-muted/50 transition-all duration-200"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={() => onEdit(doc)}
              className="flex items-center space-x-2 px-4 py-2.5 border border-border text-sm font-medium rounded-xl text-card-foreground bg-card hover:bg-muted/50 transition-all duration-200"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => onDelete(doc.id)}
              className="flex items-center space-x-2 px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir</span>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-primary/10 p-3 rounded-xl">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-card-foreground">
                {docType ? docType.name : "Tipo Desconhecido"}
              </h2>
              <p className="text-lg text-muted-foreground font-mono mt-1">{doc.docNumber}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <DetailItem label="Data e Hora do Protocolo" value={protocolDate} />
          <DetailItem label="Quantidade" value={doc.quantity} />
          <DetailItem label="Nº da Loja" value={doc.shopNumber} />
          <DetailItem label="Entregue por" value={doc.deliveredBy} />
          <DetailItem label="Protocolado por" value={doc.protocolledBy} />

          <div className="col-span-full">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Descrição / Observações</p>
              <div className="bg-muted/30 border border-border/50 rounded-lg p-6 min-h-[120px]">
                <p className="text-base text-card-foreground leading-relaxed">
                  {doc.description || "Nenhuma descrição fornecida."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
