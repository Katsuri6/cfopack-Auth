type TagVariant = 'acc' | 'grn' | 'red' | 'amb' | 'pur'

interface TagProps {
  variant?: TagVariant
  children: React.ReactNode
  small?: boolean
}

export default function Tag({ variant = 'acc', children, small }: TagProps) {
  return (
    <span className={`tag tag-${variant}`} style={small ? { fontSize: 9 } : {}}>
      {children}
    </span>
  )
}
