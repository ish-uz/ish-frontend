import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, Users, Wrench, LogIn, UserPlus, Menu, X } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2] text-white font-bold text-xl">
              ISH
            </div>
            <span className="text-xl font-bold text-gray-900">ISH</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/jobs"
              className="flex items-center space-x-1 text-gray-700 hover:text-[#0A66C2] transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Qidiruv</span>
            </Link>
            <Link
              to="/jobs"
              className="flex items-center space-x-1 text-gray-700 hover:text-[#0A66C2] transition-colors"
            >
              <Briefcase className="h-4 w-4" />
              <span>Ish qidirish</span>
            </Link>
            <Link
              to="/employees"
              className="flex items-center space-x-1 text-gray-700 hover:text-[#0A66C2] transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Xodimlar</span>
            </Link>
            <Link
              to="/freelancers"
              className="flex items-center space-x-1 text-gray-700 hover:text-[#0A66C2] transition-colors"
            >
              <Wrench className="h-4 w-4" />
              <span>Freelancerlar</span>
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/login"
              className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-[#0A66C2] transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Kirish</span>
            </Link>
            <Link
              to="/register"
              className="flex items-center space-x-1 rounded-full bg-[#0A66C2] px-4 py-2 text-white hover:bg-[#004182] transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Ro'yxatdan o'tish</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-[#0A66C2] transition-colors"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Qidiruv</span>
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Briefcase className="h-4 w-4" />
                <span>Ish qidirish</span>
              </Link>
              <Link
                to="/employees"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Xodimlar</span>
              </Link>
              <Link
                to="/freelancers"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Wrench className="h-4 w-4" />
                <span>Freelancerlar</span>
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 text-gray-700 hover:text-[#0A66C2] hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Kirish</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 rounded-full bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Ro'yxatdan o'tish</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
