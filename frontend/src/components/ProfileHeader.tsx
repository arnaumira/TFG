interface ProfileHeaderProps {
  fullName: string
  tags: string[]
}

export default function ProfileHeader({ fullName, tags }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-3">
        <span className="text-2xl font-medium text-[#0F6E56]">
          {fullName.charAt(0)}
        </span>
      </div>
      <h1 className="text-lg font-semibold text-gray-900">{fullName}</h1>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="bg-[#E1F5EE] text-[#085041] text-xs font-medium px-3 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}