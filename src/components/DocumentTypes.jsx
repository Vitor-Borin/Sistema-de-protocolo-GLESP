"use client"

import { useState } from "react"
import { PlusCircle, Edit, Trash2, Check, X } from "lucide-react"

const generateAbbreviation = (name) => {
  if (!name) return ""
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 3).toUpperCase()
}

export default function DocumentTypes({ initialDocTypes, onSave }) {
  const [docTypes, setDocTypes] = useState(initialDocTypes)
  const [newTypeName, setNewTypeName] = useState("")

  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState("")

  const [error, setError] = useState("")

  const handleAdd = () => {
    if (!newTypeName.trim()) {
      setError("O nome do documento é obrigatório.")
      return
    }
    setError("")
    const nextId = docTypes.length > 0 ? Math.max(...docTypes.map((t) => t.id)) + 1 : 1

    const newType = {
      id: nextId,
      name: newTypeName.trim(),
      abbreviation: generateAbbreviation(newTypeName),
    }
    const updatedTypes = [...docTypes, newType]
    setDocTypes(updatedTypes)
    onSave(updatedTypes)
    setNewTypeName("")
  }

  const handleDelete = (id) => {
    const updatedTypes = docTypes.filter((type) => type.id !== id)
    setDocTypes(updatedTypes)
    onSave(updatedTypes)
  }

  const startEditing = (type) => {
    setEditingId(type.id)
    setEditingName(type.name)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingName("")
  }

  const handleUpdate = () => {
    if (!editingName.trim()) {
      setError("O nome do documento é obrigatório.")
      return
    }
    setError("")
    const updatedTypes = docTypes.map((type) =>
      type.id === editingId
        ? { ...type, name: editingName.trim(), abbreviation: generateAbbreviation(editingName) }
        : type,
    )
    setDocTypes(updatedTypes)
    onSave(updatedTypes)
    cancelEditing()
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
        <h3 className="text-2xl font-bold text-card-foreground mb-6">Gerenciar Tipos de Documento</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow">
            <label htmlFor="doc-name" className="block text-sm font-semibold text-card-foreground mb-2">
              Nome do Documento
            </label>
            <input
              type="text"
              id="doc-name"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Ex: Prancha de Loja"
              className="w-full px-4 py-3 border border-border rounded-xl bg-input focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center w-full sm:w-auto space-x-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-all duration-200 hover:scale-105"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Adicionar</span>
          </button>
        </div>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mt-4">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h4 className="text-lg font-semibold text-card-foreground">Tipos Cadastrados</h4>
          <p className="text-muted-foreground text-sm mt-1">{docTypes.length} tipos de documento</p>
        </div>

        <ul role="list" className="divide-y divide-border">
          {docTypes.map((type) => (
            <li key={type.id} className="px-6 py-4">
              {editingId === type.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-input focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={cancelEditing}
                      className="flex items-center space-x-2 px-4 py-2 text-sm rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="flex items-center space-x-2 px-4 py-2 text-sm rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        #{type.id}
                      </span>
                      <p className="font-semibold text-card-foreground">{type.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono mt-2 ml-12">{type.abbreviation}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEditing(type)}
                      className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-card-foreground transition-all duration-200"
                      title="Editar"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200"
                      title="Excluir"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
