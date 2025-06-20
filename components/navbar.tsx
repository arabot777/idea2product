"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Zap, User, History, Settings, LogOut, Menu } from "lucide-react"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { signOut } from "@/app/actions/auth/sign-out"
import useSWR from "swr"
import { getCurrentUserProfile } from "@/app/actions/auth/get-user-info"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const t = useTranslations('Navbar'); // Assuming a 'Navbar' namespace for translations
  const { data: user , error, isLoading, mutate } = useSWR("current-user", getCurrentUserProfile)

  const handleSignOut = () => {
    signOut()
    setIsMenuOpen(false)
    mutate()
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>
          <span className="text-xl font-bold text-white">{t('brandName')}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium">
            {t('home')}
          </Link>
          <Link href="/task/history" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium">
            {t('history')}
          </Link>
          <Link href="/task/result" className="text-slate-300 hover:text-white transition-colors duration-200 font-medium">
            {t('resultList')}
          </Link>
          <Link
            href="/subscribe-plan"
            className="text-slate-300 hover:text-white transition-colors duration-200 font-medium"
          >
            {t('subscribePlan')}
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {(user && user.id) ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full ring-2 ring-slate-700 hover:ring-blue-500 transition-all duration-200"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar_url || ""} alt={user.username || t('userAvatarAlt')} />
                    <AvatarFallback className="bg-slate-700 text-white">
                      {user.avatar_url || (user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase())}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-slate-800/95 backdrop-blur-xl border-slate-700 overflow-hidden"
                align="end"
                forceMount
              >
                <DropdownMenuItem asChild className="hover:bg-slate-700/50">
                  <Link href="/profile" className="flex items-center text-white">
                    <User className="mr-3 h-4 w-4" />
                    {t('profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-slate-700/50">
                  <Link href="/task/history" className="flex items-center text-white">
                    <History className="mr-3 h-4 w-4" />
                    {t('history')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-slate-700/50">
                  <Link href="/profile/plans" className="flex items-center text-white">
                    <Settings className="mr-3 h-4 w-4" />
                    {t('myPlans')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-slate-700/50">
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center text-red-400 hover:text-red-400"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    {t('logout')}
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-white">
                {t('login')}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800/95 backdrop-blur-xl border-t border-slate-700/50">
          <div className="px-6 py-4 space-y-3">
            <Link href="/" className="block text-slate-300 hover:text-white transition-colors duration-200 font-medium">
              {t('home')}
            </Link>
            <Link
              href="/history"
              className="block text-slate-300 hover:text-white transition-colors duration-200 font-medium"
            >
              {t('history')}
            </Link>
            <Link
              href="/subscribe"
              className="block text-slate-300 hover:text-white transition-colors duration-200 font-medium"
            >
              {t('subscribe')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}