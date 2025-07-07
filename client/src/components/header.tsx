import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Menu, Users, MessageSquare, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "수퍼바이저 찾기", href: "/", icon: Users },
    { name: "전국민마음투자지원사업", href: "/national-program", icon: MessageSquare },
    { name: "커뮤니티", href: "/community", icon: MessageSquare },
    { name: "최신심리학정보", href: "/psychology-info", icon: MessageSquare },
    { name: "교육정보", href: "/education-info", icon: MessageSquare },
    ...(isAuthenticated && user?.role === 'admin' ? [{ name: "관리자", href: "/admin-dashboard", icon: Shield }] : []),
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    window.location.href = "/";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-xl font-bold text-blue-600 cursor-pointer">
                좋은 수련, 좋은 상담자
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              return (
                <Link key={item.name} href={item.href}>
                  <button
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <Link href="/my-page" className="hidden sm:block">
                  <Button
                    variant={location === "/my-page" ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>마이페이지</span>
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName} />
                        <AvatarFallback className="text-sm">
                          {user.firstName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <div className="flex items-center justify-start space-x-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName} />
                        <AvatarFallback className="text-sm">
                          {user.firstName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                        <Badge 
                          variant={
                            user.role === 'supervisor' ? 'default' : 
                            user.role === 'admin' ? 'destructive' : 'secondary'
                          }
                          className="text-xs w-fit"
                        >
                          {user.role === 'supervisor' ? '슈퍼바이저' : 
                           user.role === 'admin' ? '관리자' : '수련생'}
                        </Badge>
                      </div>
                    </div>
                    <div className="border-t">
                      <DropdownMenuItem asChild>
                        <Link href="/my-page" className="cursor-pointer flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>마이페이지</span>
                        </Link>
                      </DropdownMenuItem>
                      {user.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin-dashboard" className="cursor-pointer flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>관리자</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>로그아웃</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">
                    로그인
                  </Button>
                </Link>
                <Link href="/register">
                  <Button>
                    회원가입
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.name} href={item.href}>
                        <button
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left transition-colors ${
                            isActive(item.href)
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.name}</span>
                        </button>
                      </Link>
                    );
                  })}

                  {isAuthenticated && (
                    <>
                      <div className="border-t pt-4">
                        <Link href="/my-page">
                          <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left transition-colors ${
                              location === "/my-page"
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                            }`}
                          >
                            <Settings className="h-5 w-5" />
                            <span className="font-medium">마이페이지</span>
                          </button>
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="font-medium">로그아웃</span>
                        </button>
                      </div>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
