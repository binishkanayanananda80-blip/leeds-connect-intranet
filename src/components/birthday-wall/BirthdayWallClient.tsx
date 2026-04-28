'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Cake, MessageCircle, Star, Calendar, Search, ChevronRight } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { createDirectMessage } from '@/app/chat/actions';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTHS = [
  { id: 0, name: 'January', short: 'Jan' },
  { id: 1, name: 'February', short: 'Feb' },
  { id: 2, name: 'March', short: 'Mar' },
  { id: 3, name: 'April', short: 'Apr' },
  { id: 4, name: 'May', short: 'May' },
  { id: 5, name: 'June', short: 'Jun' },
  { id: 6, name: 'July', short: 'Jul' },
  { id: 7, name: 'August', short: 'Aug' },
  { id: 8, name: 'September', short: 'Sep' },
  { id: 9, name: 'October', short: 'Oct' },
  { id: 10, name: 'November', short: 'Nov' },
  { id: 11, name: 'December', short: 'Dec' },
];

export function BirthdayWallClient({ users }: { users: any[] }) {
  const [selectedMonth, setSelectedMonth] = useState<number | 'default' | 'all'>('default');
  const [searchQuery, setSearchQuery] = useState('');

  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const nextMonthIdx = (currentMonthIdx + 1) % 12;

  const currentMonthName = MONTHS[currentMonthIdx].name;
  const nextMonthName = MONTHS[nextMonthIdx].name;

  // Process and sort users by day of birth
  const processedUsers = useMemo(() => {
    return users.map(u => {
      const dob = parseISO(u.dateOfBirth);
      return {
        ...u,
        birthMonth: dob.getMonth(),
        birthDay: dob.getDate(),
        formattedDate: format(dob, 'MMMM dd'),
      };
    }).sort((a, b) => a.birthDay - b.birthDay);
  }, [users]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    let list = processedUsers;
    if (searchQuery) {
      list = list.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (selectedMonth === 'default') {
      return {
        current: list.filter(u => u.birthMonth === currentMonthIdx),
        upcoming: list.filter(u => u.birthMonth === nextMonthIdx),
      };
    } else if (selectedMonth === 'all') {
      return { all: list };
    } else {
      return { single: list.filter(u => u.birthMonth === selectedMonth) };
    }
  }, [processedUsers, selectedMonth, searchQuery, currentMonthIdx, nextMonthIdx]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 pb-24 space-y-12">
      
      {/* ── HEADER ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[3rem] bg-white p-1 shadow-premium border border-gray-100 overflow-hidden"
      >
        <div className="relative bg-primary rounded-[2.8rem] py-12 md:py-16 px-10 md:px-14 overflow-hidden">
          <div className="relative z-20 max-w-2xl">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-xl shadow-inner">
                <Cake className="w-8 h-8 text-gold-leeds animate-bounce" />
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
                  Birthday <span className="text-gold-leeds">Wall</span>
                </h1>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Leeds Connect • Celebrate Excellence</p>
              </div>
            </div>
            <p className="text-lg text-white/70 font-medium leading-relaxed">
              Every milestone matters. Join us in celebrating the extraordinary people who make Leeds International School a beacon of excellence.
            </p>
          </div>
          
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gold-leeds/10 rounded-full blur-[100px] pointer-events-none" />
        </div>
      </motion.div>

      {/* ── NAVIGATION & FILTERS ── */}
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-between bg-white p-4 rounded-[2.5rem] shadow-soft border border-gray-50">
        {/* Month Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedMonth('default')}
            className={cn(
              "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
              selectedMonth === 'default' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"
            )}
          >
            Overview
          </button>
          <div className="w-px h-6 bg-gray-100 mx-2 hidden sm:block" />
          {MONTHS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMonth(m.id)}
              className={cn(
                "px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                selectedMonth === m.id ? "bg-gold-leeds text-white shadow-lg scale-110" : "text-gray-400 hover:bg-gray-50"
              )}
            >
              {m.short}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search colleagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary/20 rounded-2xl pl-12 pr-6 py-3 text-xs font-bold outline-none transition-all"
          />
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div className="space-y-16">
        <AnimatePresence mode="wait">
          {/* DEFAULT VIEW (Current & Next Month) */}
          {selectedMonth === 'default' && (
            <motion.div
              key="default-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              {/* CURRENT MONTH SECTION */}
              <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                      This Month: <span className="text-primary">{currentMonthName}</span>
                    </h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Celebrations</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredUsers.current.map((u, i) => (
                    <BirthdayCard key={u.id} user={u} delay={i * 0.05} theme="primary" />
                  ))}
                  {filteredUsers.current.length === 0 && <EmptyState month={currentMonthName} />}
                </div>
              </section>

              {/* UPCOMING MONTH SECTION */}
              <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                      Next Month: <span className="text-gold-leeds">{nextMonthName}</span>
                    </h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coming up shortly</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gold-leeds/5 flex items-center justify-center text-gold-leeds">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredUsers.upcoming.map((u, i) => (
                    <BirthdayCard key={u.id} user={u} delay={i * 0.05} theme="gold" />
                  ))}
                  {filteredUsers.upcoming.length === 0 && <EmptyState month={nextMonthName} />}
                </div>
              </section>
            </motion.div>
          )}

          {/* SINGLE MONTH VIEW */}
          {typeof selectedMonth === 'number' && (
            <motion.div
              key={`month-${selectedMonth}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-1 px-2">
                <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight">
                  All Birthdays in <span className="text-primary">{MONTHS[selectedMonth].name}</span>
                </h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Archive of celebrations</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredUsers.single.map((u, i) => (
                  <BirthdayCard key={u.id} user={u} delay={i * 0.05} theme="standard" />
                ))}
                {filteredUsers.single.length === 0 && <EmptyState month={MONTHS[selectedMonth].name} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BirthdayCard({ user, delay, theme }: { user: any, delay: number, theme: 'primary' | 'gold' | 'standard' }) {
  const isToday = new Date().getMonth() === user.birthMonth && new Date().getDate() === user.birthDay;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -8 }}
      className="relative group"
    >
      <div className={cn(
        "bg-white rounded-[3rem] p-8 flex flex-col items-center text-center shadow-soft border border-gray-50 transition-all duration-300 hover:shadow-premium group-hover:border-transparent",
        isToday && "ring-4 ring-gold-leeds ring-offset-4 ring-offset-[#F8F9FC]"
      )}>
        {/* Date Badge */}
        <div className={cn(
          "absolute top-6 left-6 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border",
          theme === 'primary' ? "bg-primary/5 text-primary border-primary/10" :
          theme === 'gold' ? "bg-gold-leeds/5 text-gold-leeds border-gold-leeds/10" :
          "bg-gray-50 text-gray-400 border-gray-100"
        )}>
          {user.formattedDate}
        </div>

        {/* Avatar */}
        <div className="relative mt-8 mb-6">
          <UserAvatar 
            imageUrl={user.image} 
            name={user.name} 
            size="2xl" 
            className={cn(
              "ring-8 transition-all duration-500",
              theme === 'primary' ? "ring-primary/5 group-hover:ring-primary/20" :
              theme === 'gold' ? "ring-gold-leeds/5 group-hover:ring-gold-leeds/20" :
              "ring-gray-50 group-hover:ring-gray-100"
            )} 
          />
          {isToday && (
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gold-leeds rounded-full flex items-center justify-center text-white border-4 border-white shadow-xl animate-pulse">
              <Star className="w-5 h-5 fill-current" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2 mb-8">
          <h4 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors tracking-tight">
            {user.name}
          </h4>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] line-clamp-1">
              {user.designation || user.role?.name || 'Staff Member'}
            </p>
            <p className="text-[9px] font-bold text-primary uppercase tracking-widest opacity-60">
              {user.branch?.name || 'Corporate'}
            </p>
          </div>
        </div>

        {/* Wish Button */}
        <form action={createDirectMessage} className="w-full">
          <input type="hidden" name="targetId" value={user.id} />
          <input type="hidden" name="initialMessage" value={`Happy Birthday ${user.name}! 🎉\n\nWishing you a day filled with happiness, laughter, and all the things you love most.\n\nMay this year bring you new opportunities, good health, and success!`} />
          <button 
            type="submit" 
            className={cn(
              "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95",
              theme === 'primary' ? "bg-primary text-white shadow-primary/20 hover:shadow-primary/30" :
              theme === 'gold' ? "bg-gold-leeds text-white shadow-gold-leeds/20 hover:shadow-gold-leeds/30" :
              "bg-gray-900 text-white shadow-gray-200 hover:shadow-gray-300"
            )}
          >
            <MessageCircle className="w-4 h-4" /> Send Wish
          </button>
        </form>
      </div>
    </motion.div>
  );
}

function EmptyState({ month }: { month: string }) {
  return (
    <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200 mb-4">
        <Cake size={32} />
      </div>
      <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">
        No birthdays recorded for {month}
      </p>
    </div>
  );
}
