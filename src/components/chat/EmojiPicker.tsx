'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'

// Curated list of high-quality 3D emoji mappings (Microsoft Fluent style)
const BASE_URL = 'https://fonts.gstatic.com/s/e/notoemoji/latest'

// Mapping emojis to Google's Animated 3D (hex codes)
export const ANIMATED_EMOJIS: Record<string, { name: string, hex: string }> = {
  '😀': { name: 'Grinning Face', hex: '1f600' },
  '😃': { name: 'Grinning Face with Big Eyes', hex: '1f603' },
  '😄': { name: 'Grinning Face with Smiling Eyes', hex: '1f604' },
  '😁': { name: 'Beaming Face with Smiling Eyes', hex: '1f601' },
  '😅': { name: 'Grinning Face with Sweat', hex: '1f605' },
  '😂': { name: 'Face with Tears of Joy', hex: '1f602' },
  '🤣': { name: 'Rolling on the Floor Laughing', hex: '1f923' },
  '😊': { name: 'Smiling Face with Smiling Eyes', hex: '1f60a' },
  '😇': { name: 'Smiling Face with Halo', hex: '1f607' },
  '🥰': { name: 'Smiling Face with Hearts', hex: '1f970' },
  '😍': { name: 'Smiling Face with Heart-Eyes', hex: '1f60d' },
  '🤩': { name: 'Star-Struck', hex: '1f929' },
  '😘': { name: 'Face Blowing a Kiss', hex: '1f618' },
  '😋': { name: 'Face Savoring Food', hex: '1f60b' },
  '😛': { name: 'Face with Tongue', hex: '1f61b' },
  '😜': { name: 'Winking Face with Tongue', hex: '1f61c' },
  '🤪': { name: 'Zany Face', hex: '1f92a' },
  '🤗': { name: 'Hugging Face', hex: '1f917' },
  '🤔': { name: 'Thinking Face', hex: '1f914' },
  '🤫': { name: 'Shushing Face', hex: '1f92b' },
  '😏': { name: 'Smirking Face', hex: '1f60f' },
  '😌': { name: 'Relieved Face', hex: '1f60c' },
  '😴': { name: 'Sleeping Face', hex: '1f634' },
  '🥳': { name: 'Partying Face', hex: '1f973' },
  '👋': { name: 'Waving Hand', hex: '1f44b' },
  '👌': { name: 'OK Hand', hex: '1f44c' },
  '✌️': { name: 'Victory Hand', hex: '270c' },
  '🤞': { name: 'Crossed Fingers', hex: '1f91e' },
  '🤟': { name: 'Love-You Gesture', hex: '1f91f' },
  '🤙': { name: 'Call Me Hand', hex: '1f919' },
  '👍': { name: 'Thumbs Up', hex: '1f44d' },
  '👎': { name: 'Thumbs Down', hex: '1f44e' },
  '👏': { name: 'Clapping Hands', hex: '1f44f' },
  '🙌': { name: 'Raising Hands', hex: '1f64c' },
  '🙏': { name: 'Folded Hands', hex: '1f64f' },
  '🤝': { name: 'Handshake', hex: '1f91d' },
  '❤️': { name: 'Red Heart', hex: '2764' },
  '🧡': { name: 'Orange Heart', hex: '1f9e1' },
  '💛': { name: 'Yellow Heart', hex: '1f49b' },
  '💚': { name: 'Green Heart', hex: '1f49a' },
  '💙': { name: 'Blue Heart', hex: '1f499' },
  '💜': { name: 'Purple Heart', hex: '1f49c' },
  '🖤': { name: 'Black Heart', hex: '1f5a4' },
  '🤍': { name: 'White Heart', hex: '1f90d' },
  '💔': { name: 'Broken Heart', hex: '1f494' },
  '💖': { name: 'Sparkling Heart', hex: '1f496' },
  '🔥': { name: 'Fire', hex: '1f525' },
  '🎉': { name: 'Party Popper', hex: '1f389' },
  '✨': { name: 'Sparkles', hex: '2728' },
  '🚀': { name: 'Rocket', hex: '1f680' },
}

const EMOJI_CATEGORIES = [
  { name: 'Smilies', emojis: Object.keys(ANIMATED_EMOJIS).slice(0, 24) },
  { name: 'Gestures', emojis: Object.keys(ANIMATED_EMOJIS).slice(24, 36) },
  { name: 'Hearts', emojis: Object.keys(ANIMATED_EMOJIS).slice(36) },
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[0].name)

  const filteredCategories = useMemo(() => {
    if (!search) return EMOJI_CATEGORIES
    return EMOJI_CATEGORIES.map(cat => ({
      ...cat,
      emojis: cat.emojis.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    })).filter(cat => cat.emojis.length > 0)
  }, [search])

  return (
    <div className="absolute bottom-full left-0 mb-4 w-[340px] max-h-[500px] bg-white rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.25)] border border-gray-100 overflow-hidden flex flex-col z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Search Bar */}
      <div className="p-5 bg-white flex items-center gap-3">
        <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-2 border border-transparent focus-within:border-[#5A2D82]/20 transition-all">
          <Search size={18} className="text-gray-400" />
          <input 
            autoFocus
            placeholder="Search 3D emojis..." 
            className="flex-1 bg-transparent text-[15px] outline-none text-gray-700 font-medium placeholder:text-gray-300"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')} className="hover:bg-gray-200 rounded-full p-1"><X size={12} className="text-gray-400" /></button>}
        </div>
      </div>

      {/* Category Tabs - Clean High-End Selection */}
      <div className="flex px-4 py-2 border-b border-gray-50 bg-white">
        {EMOJI_CATEGORIES.map(cat => (
          <button 
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
              activeCategory === cat.name 
                ? 'bg-[#5A2D82] text-white shadow-xl shadow-[#5A2D82]/30 scale-[1.02]' 
                : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white">
        {filteredCategories.map(cat => (
          <div key={cat.name} className="mb-8">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-5 px-1">{cat.name}</h3>
            <div className="grid grid-cols-4 gap-5">
              {cat.emojis.map(char => {
                const emoji = ANIMATED_EMOJIS[char]
                if (!emoji) return null
                return (
                  <button 
                    key={char}
                    onClick={() => onSelect(char)}
                    title={emoji.name}
                    className="w-16 h-16 flex items-center justify-center hover:bg-[#5A2D82]/5 rounded-[20px] transition-all duration-300 transform hover:scale-110 active:scale-95 p-1 group"
                  >
                    <img 
                      src={`${BASE_URL}/${emoji.hex}/512.gif`} 
                      alt={emoji.name} 
                      className="w-full h-full object-contain drop-shadow-md select-none group-hover:drop-shadow-xl" 
                    />
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search size={24} className="text-gray-200" />
            </div>
            <p className="text-sm text-gray-400 font-medium">No animated emojis match your search</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Fluent 3D Assets</span>
        </div>
        <button onClick={onClose} className="text-[10px] font-black text-[#5A2D82] hover:text-[#4A256B] uppercase tracking-wider transition-colors">Dismiss</button>
      </div>
    </div>
  )
}
