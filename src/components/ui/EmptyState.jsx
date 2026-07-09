export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && <Icon size={48} className="text-muted mb-4" />}
      <h3 className="text-lg font-medium text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-secondary mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
