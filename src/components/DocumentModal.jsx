"use client"

import { useState, useEffect } from "react"
import { callGeminiApi } from "../services/gemini"
import { Loader, X, Sparkles } from "lucide-react"

export default function DocumentModal({ isOpen, onClose, onSave, documentTypes, editingDoc }) {
  const [docCode, setDocCode] = useState("")
  const [docName, setDocName] = useState("")
  const [typeId, setTypeId] = useState("")
  const [shopNumber, setShopNumber] = useState("")
  const [deliveredBy, setDeliveredBy] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [description, setDescription] = useState("")

  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (editingDoc) {
      const docType = documentTypes.find((t) => t.id === editingDoc.typeId)
      if (docType) {
        setDocCode(docType.id || "")
        setDocName(docType.name || "")
        setTypeId(docType.id)
      }
      setShopNumber(editingDoc.shopNumber || "")
      setDeliveredBy(editingDoc.deliveredBy || "")
      setQuantity(editingDoc.quantity || 1)
      setDescription(editingDoc.description || "")
    } else {
      setDocCode("")
      setDocName("")
      setTypeId("")
      setShopNumber("")
      setDeliveredBy("")
      setQuantity(1)
      setDescription("")
    }
  }, [editingDoc, isOpen, documentTypes])

  useEffect(() => {
    const codeToSearch = docCode.trim()
    if (codeToSearch) {
      const foundType = documentTypes.find((type) => String(type.id) === codeToSearch)
      if (foundType) {
        setDocName(foundType.name)
        setTypeId(foundType.id)
        setError("")
      } else {
        setDocName("Código não encontrado")
        setTypeId("")
      }
    } else {
      setDocName("")
      setTypeId("")
    }
  }, [docCode, documentTypes])

  const handleGenerateDescription = async () => {
    if (!typeId) {
      setError("Por favor, insira um código de documento válido para gerar a descrição.")
      return
    }
    setIsGenerating(true)
    setError("")
    try {
      const prompt = `Crie uma breve descrição para um protocolo de documento do tipo "${docName}", entregue pela loja de número "${shopNumber || "não especificado"}" e pelo irmão "${deliveredBy || "não especificado"}". A descrição deve ser formal e concisa.`
      const generatedDesc = await callGeminiApi(prompt)
      setDescription(generatedDesc)
    } catch (err) {
      setError("Falha ao gerar descrição com IA. Verifique a chave de API e tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!typeId || !shopNumber || !deliveredBy || quantity < 1) {
      setError("Código do Documento, Nº da Loja, Nome do Entregador e Quantidade são obrigatórios.")
      return
    }
    setIsSaving(true)
    setError("")

    const docData = { typeId, shopNumber, deliveredBy, quantity: Number(quantity), description }

    setTimeout(() => {
      onSave(docData)
      setIsSaving(false)
      onClose()
    }, 500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/60 backdrop-blur-sm animate-scale-in">
      <div className="bg-popover border border-border rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-muted-foreground rounded-full hover:text-foreground hover:bg-muted p-2 transition-all duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-popover-foreground mb-2">
            {editingDoc ? "Editar Protocolo" : "Novo Protocolo"}
          </h3>
          <p className="text-muted-foreground">
            {editingDoc ? "Atualize as informações do protocolo" : "Preencha os dados para criar um novo protocolo"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="docCode" className="block text-sm font-semibold text-popover-foreground mb-2">
                Código do Documento
              </label>
              <input
                type="text"
                id="docCode"
                value={docCode}
                onChange={(e) => setDocCode(e.target.value)}
                placeholder="Ex: 1"
                className="block w-full rounded-xl border border-border bg-input px-4 py-3 text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
              />
            </div>
            <div>
              <label htmlFor="docName" className="block text-sm font-semibold text-popover-foreground mb-2">
                Nome do Documento
              </label>
              <input
                type="text"
                id="docName"
                value={docName}
                readOnly
                placeholder="Automático"
                className="block w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm cursor-not-allowed text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="shopNumber" className="block text-sm font-semibold text-popover-foreground mb-2">
                Nº da Loja
              </label>
              <input
                type="text"
                id="shopNumber"
                value={shopNumber}
                onChange={(e) => setShopNumber(e.target.value)}
                className="block w-full rounded-xl border border-border bg-input px-4 py-3 text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-semibold text-popover-foreground mb-2">
                Quantidade
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(e.target.value)}
                className="block w-full rounded-xl border border-border bg-input px-4 py-3 text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="deliveredBy" className="block text-sm font-semibold text-popover-foreground mb-2">
              Nome do Entregador
            </label>
            <input
              type="text"
              id="deliveredBy"
              value={deliveredBy}
              onChange={(e) => setDeliveredBy(e.target.value)}
              className="block w-full rounded-xl border border-border bg-input px-4 py-3 text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="description" className="text-sm font-semibold text-popover-foreground">
                Descrição (Opcional)
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                className="flex items-center space-x-2 text-xs font-medium text-accent hover:text-accent/80 disabled:text-muted-foreground transition-colors px-3 py-1 rounded-lg hover:bg-accent/10"
              >
                {isGenerating ? <Loader className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                <span>Sugerir com IA</span>
              </button>
            </div>
            <textarea
              id="description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-xl border border-border bg-input px-4 py-3 text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all resize-none"
              placeholder="Descreva detalhes adicionais sobre o protocolo..."
            ></textarea>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-muted-foreground bg-muted border border-border rounded-xl hover:bg-muted/80 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center items-center px-6 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 disabled:bg-primary/50 transition-all duration-200 min-w-[100px]"
            >
              {isSaving ? <Loader className="animate-spin h-5 w-5" /> : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
