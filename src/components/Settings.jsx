import DocumentTypes from "./DocumentTypes"

export default function Settings({ documentTypes, onSave }) {
  return (
    <div className="animate-fade-in-up">
      <DocumentTypes initialDocTypes={documentTypes} onSave={onSave} />
    </div>
  )
}
