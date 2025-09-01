"use client"

import { useState } from "react"
import { GlespLogo } from "./GlespLogo"
import Footer from "./Footer"
import DocumentModal from "./DocumentModal"
import ReceiptModal from "./ReceiptModal"
import DocumentDetail from "./DocumentDetail"
import Settings from "./Settings"
import {
  LogOut,
  PlusCircle,
  Search,
  SettingsIcon,
  Home,
  Clock,
  FileText,
  User,
  Menu,
  X,
  TrendingUp,
} from "lucide-react"
import { PREDEFINED_DOC_TYPES, MOCK_DOCUMENTS } from "../data/predefinedData"

export default function Dashboard({ user, onLogout }) {
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS)
  const [documentTypes, setDocumentTypes] = useState(PREDEFINED_DOC_TYPES)

  const [searchQuery, setSearchQuery] = useState("")

  const [currentView, setCurrentView] = useState("list")
  const [selectedDoc, setSelectedDoc] = useState(null)

  const [isDocModalOpen, setIsDocModalOpen] = useState(false)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(null)
  const [editingDoc, setEditingDoc] = useState(null)

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [isSidebarPinned, setIsSidebarPinned] = useState(false)

  const isSidebarOpen = isSidebarExpanded || isSidebarPinned

  const handleSaveDocument = (docData) => {
    if (editingDoc) {
      setDocuments((docs) => docs.map((d) => (d.id === editingDoc.id ? { ...editingDoc, ...docData } : d)))
    } else {
      const nextDocNumber = documents.length + 1
      const formattedNumber = String(nextDocNumber).padStart(3, "0")

      const newDoc = {
        ...docData,
        id: `doc${Date.now()}`,
        docNumber: `GLESP-${new Date().getFullYear()}-${formattedNumber}`,
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
        protocolledBy: user.displayName || user.email,
      }
      setDocuments((docs) => [newDoc, ...docs])
    }
    setEditingDoc(null)
  }

  const handleDeleteDocument = (docId) => {
    setDocuments((docs) => docs.filter((d) => d.id !== docId))
    setCurrentView("list")
  }

  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc)
    setCurrentView("detail")
  }

  const openEditModal = (doc) => {
    setEditingDoc(doc)
    setIsDocModalOpen(true)
  }

  const handleSaveDocTypes = (newTypes) => {
    setDocumentTypes(newTypes)
  }

  const filteredDocuments = documents.filter((doc) => {
    const type = documentTypes.find((t) => t.id === doc.typeId)
    const searchLower = searchQuery.toLowerCase()
    return (
      doc.docNumber.toLowerCase().includes(searchLower) ||
      (type && type.name.toLowerCase().includes(searchLower)) ||
      (doc.shopNumber && doc.shopNumber.toLowerCase().includes(searchLower)) ||
      doc.deliveredBy.toLowerCase().includes(searchLower) ||
      doc.protocolledBy.toLowerCase().includes(searchLower)
    )
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const protocolsToday = documents.filter((doc) => {
    const docDate = new Date(doc.createdAt.seconds * 1000)
    docDate.setHours(0, 0, 0, 0)
    return docDate.getTime() === today.getTime()
  }).length

  const renderView = () => {
    switch (currentView) {
      case "detail":
        return (
          <DocumentDetail
            doc={selectedDoc}
            documentTypes={documentTypes}
            onBack={() => setCurrentView("list")}
            onDelete={handleDeleteDocument}
            onEdit={openEditModal}
            onPrint={() => setIsReceiptModalOpen(selectedDoc)}
          />
        )
      case "settings":
        return <Settings documentTypes={documentTypes} onSave={handleSaveDocTypes} />
      case "list":
      default:
        return (
          <div className="animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total de Protocolos</p>
                    <p className="text-3xl font-bold text-card-foreground">{documents.length}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Protocolos Hoje</p>
                    <p className="text-3xl font-bold text-card-foreground">{protocolsToday}</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-xl group-hover:bg-accent/20 transition-colors">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Tipos Cadastrados</p>
                    <p className="text-3xl font-bold text-card-foreground">{documentTypes.length}</p>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-xl group-hover:bg-secondary/20 transition-colors">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar protocolos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl shadow-sm focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-sm"
                />
              </div>
              <button
                onClick={() => {
                  setEditingDoc(null)
                  setIsDocModalOpen(true)
                }}
                className="flex items-center justify-center w-full sm:w-auto space-x-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 hover:scale-105"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Novo Protocolo</span>
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              {filteredDocuments.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-card-foreground mb-2">Nenhum protocolo encontrado</p>
                  <p className="text-muted-foreground">
                    {searchQuery ? "Tente ajustar sua busca" : "Comece criando seu primeiro protocolo"}
                  </p>
                </div>
              ) : (
                <ul role="list" className="divide-y divide-border">
                  {filteredDocuments.map((doc) => {
                    const docType = documentTypes.find((t) => t.id === doc.typeId)
                    return (
                      <li
                        key={doc.id}
                        onClick={() => handleSelectDoc(doc)}
                        className="px-6 py-4 hover:bg-muted/50 transition-colors duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-primary group-hover:text-primary/80 transition-colors truncate">
                              {docType ? docType.name : "Tipo Desconhecido"}
                            </p>
                            <p className="text-sm text-muted-foreground font-mono mt-1">{doc.docNumber}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Loja {doc.shopNumber} • {doc.deliveredBy}
                            </p>
                          </div>
                          <div className="flex flex-col items-end text-right">
                            <p className="text-sm font-medium text-card-foreground">
                              {new Date(doc.createdAt.seconds * 1000).toLocaleDateString("pt-BR")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(doc.createdAt.seconds * 1000).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <nav
        className={`
                    bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 transition-all duration-300 ease-in-out shadow-sm
                    ${isSidebarOpen ? "w-64" : "w-20"}
                `}
        onMouseEnter={() => {
          if (!isSidebarPinned) setIsSidebarExpanded(true)
        }}
        onMouseLeave={() => {
          if (!isSidebarPinned) setIsSidebarExpanded(false)
        }}
      >
        <div className={`flex items-center h-16 border-b border-sidebar-border px-6 shrink-0 overflow-hidden`}>
          <GlespLogo className="h-10 w-auto" />
          <span
            className={`text-xl font-bold text-sidebar-foreground whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? "opacity-100 ml-3" : "opacity-0"}`}
          >
            Protocolos
          </span>
        </div>

        <ul className="flex flex-col space-y-2 p-4 flex-grow">
          <li>
            <button
              onClick={() => setCurrentView("list")}
              className={`flex items-center p-3 rounded-xl w-full text-left font-medium transition-all duration-200 overflow-hidden ${!isSidebarOpen && "justify-center"}
                                ${
                                  currentView === "list" || currentView === "detail"
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-accent"
                                }`}
            >
              <Home className="h-5 w-5 shrink-0" />
              <span
                className={`whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? "ml-3 opacity-100" : "opacity-0 w-0"}`}
              >
                Protocolos
              </span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentView("settings")}
              className={`flex items-center p-3 rounded-xl w-full text-left font-medium transition-all duration-200 overflow-hidden ${!isSidebarOpen && "justify-center"}
                                ${
                                  currentView === "settings"
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-accent"
                                }`}
            >
              <SettingsIcon className="h-5 w-5 shrink-0" />
              <span
                className={`whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? "ml-3 opacity-100" : "opacity-0 w-0"}`}
              >
                Cadastros
              </span>
            </button>
          </li>
        </ul>

        <div className="border-t border-sidebar-border p-4 shrink-0 space-y-2">
          <button
            onClick={() => setIsSidebarPinned(!isSidebarPinned)}
            className={`flex items-center p-3 rounded-xl w-full text-left text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-accent transition-all duration-200 overflow-hidden ${!isSidebarOpen && "justify-center"}`}
            title={isSidebarPinned ? "Desafixar menu" : "Afixar menu"}
          >
            {isSidebarPinned ? <X className="h-5 w-5 shrink-0" /> : <Menu className="h-5 w-5 shrink-0" />}
            <span
              className={`font-medium whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? "ml-3 opacity-100" : "opacity-0 w-0"}`}
            >
              {isSidebarPinned ? "Recolher" : "Expandir"}
            </span>
          </button>

          <div
            className={`flex items-center p-3 overflow-hidden bg-sidebar-accent/5 rounded-xl ${isSidebarOpen ? "space-x-3" : "justify-center"}`}
          >
            <div className="bg-sidebar-accent/20 rounded-full p-2 shrink-0">
              <User className="h-5 w-5 text-sidebar-accent" />
            </div>
            <div
              className={`overflow-hidden transition-all duration-200 ${isSidebarOpen ? "w-full opacity-100" : "w-0 opacity-0"}`}
            >
              <p className="font-semibold text-sm text-sidebar-foreground truncate">{user.displayName}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className={`flex items-center p-3 rounded-xl w-full text-left text-destructive hover:bg-destructive/10 font-medium transition-all duration-200 overflow-hidden ${!isSidebarOpen && "justify-center"}`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span
              className={`whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? "ml-3 opacity-100" : "opacity-0 w-0"}`}
            >
              Sair
            </span>
          </button>
        </div>
      </nav>

      <div className="flex-grow w-full flex flex-col">
        <header className="bg-background/80 backdrop-blur-lg sticky top-0 z-10 border-b border-border">
          <div className="px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-foreground">
              {currentView === "list" && "Painel de Protocolos"}
              {currentView === "detail" && "Detalhes do Protocolo"}
              {currentView === "settings" && "Cadastros do Sistema"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentView === "list" && "Gerencie todos os protocolos da loja"}
              {currentView === "detail" && "Visualize e edite as informações do protocolo"}
              {currentView === "settings" && "Configure os tipos de documentos"}
            </p>
          </div>
        </header>

        <main className="flex-grow p-6 lg:p-8 overflow-y-auto">{renderView()}</main>

        <Footer />
      </div>

      <DocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSave={handleSaveDocument}
        documentTypes={documentTypes}
        editingDoc={editingDoc}
      />

      <ReceiptModal
        doc={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(null)}
        documentTypes={documentTypes}
      />
    </div>
  )
}
