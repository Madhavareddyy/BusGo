import React, { useState } from 'react';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Search, 
  ShieldCheck, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Logo } from './components/common/Logo';
import { Button } from './components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { Modal } from './components/ui/Modal';
import { BusCardSkeleton } from './components/ui/Skeleton';
import { THEME } from './constants/theme';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const toggleLoading = () => {
    setBtnLoading(true);
    setTimeout(() => setBtnLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-brand-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Badge variant="primary" size="md" dot>
              Phase 1: Design System Active
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setModalOpen(true)}
            >
              Test Modal Dialog
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Hero Banner Showcase */}
        <section className="bg-gradient-to-r from-brand-navy to-slate-800 rounded-card-lg p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              BusGo Commercial Design System
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              redBus-Inspired Modern Travel Interface
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Engineered with clean sans-serif Inter typography, exact custom hex tokens, subtle elevated shadows, accessible form components, and production-ready responsiveness.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button 
                variant="primary" 
                size="lg" 
                icon={ArrowRight} 
                iconPosition="right"
                isLoading={btnLoading}
                onClick={toggleLoading}
              >
                Simulate Loading State
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white"
                onClick={() => setModalOpen(true)}
              >
                Inspect Design Tokens
              </Button>
            </div>
          </div>
          {/* Subtle background graphic */}
          <div className="absolute right-4 bottom-[-20px] opacity-10 pointer-events-none hidden md:block">
            <Bus className="w-96 h-96 text-white" />
          </div>
        </section>

        {/* Color Palette Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">Exact Design System Colors</h2>
              <p className="text-sm text-brand-muted">Validated against project specification</p>
            </div>
            <Badge variant="navy">10 Tokens Defined</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: 'Primary Red', hex: '#D84E55', role: 'Main CTA & Brand' },
              { name: 'Dark Red', hex: '#C73540', role: 'Hover & Focus' },
              { name: 'Dark Navy', hex: '#1F2937', role: 'Headings & Accents' },
              { name: 'Text Primary', hex: '#344054', role: 'Body & Titles' },
              { name: 'Muted Text', hex: '#667085', role: 'Subtitles & Hints' },
              { name: 'Background', hex: '#F7F8FA', role: 'Canvas Background' },
              { name: 'White Surface', hex: '#FFFFFF', role: 'Elevated Cards' },
              { name: 'Border', hex: '#E5E7EB', role: 'Dividers & Borders' },
              { name: 'Success Green', hex: '#159957', role: 'Available / Confirmed' },
              { name: 'Warning Amber', hex: '#F59E0B', role: 'Lock Timers / Alerts' },
            ].map((color) => (
              <div 
                key={color.hex} 
                className="bg-white rounded-card p-3 border border-brand-border shadow-sm flex flex-col justify-between h-28"
              >
                <div 
                  className="w-full h-12 rounded-lg border border-black/10 shadow-inner flex items-center justify-center text-xs font-mono font-bold"
                  style={{ 
                    backgroundColor: color.hex, 
                    color: ['#FFFFFF', '#F7F8FA', '#E5E7EB'].includes(color.hex) ? '#1F2937' : '#FFFFFF' 
                  }}
                >
                  {color.hex}
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-navy truncate">{color.name}</p>
                  <p className="text-[11px] text-brand-muted truncate">{color.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* UI Component Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Atomic Buttons & Badges */}
          <Card hover>
            <CardHeader>
              <CardTitle>Buttons & Badges</CardTitle>
              <CardDescription>Multi-state buttons, loading indicators, and pill badges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-brand-muted uppercase">Button Variants</span>
                <div className="flex flex-wrap gap-2.5">
                  <Button variant="primary" size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="outline" size="sm">Outline</Button>
                  <Button variant="ghost" size="sm">Ghost</Button>
                  <Button variant="success" size="sm">Success</Button>
                  <Button variant="danger" size="sm">Danger</Button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-brand-muted uppercase">Button Sizes & Icons</span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button size="sm" icon={Search}>Small</Button>
                  <Button size="md" icon={Calendar}>Medium</Button>
                  <Button size="lg" icon={MapPin}>Large</Button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-brand-muted uppercase">Status Badges</span>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary" dot>Fast Filling</Badge>
                  <Badge variant="success" dot>Available (32)</Badge>
                  <Badge variant="warning" dot>Seat Locked (08:42)</Badge>
                  <Badge variant="danger" dot>Sold Out</Badge>
                  <Badge variant="navy">Volvo Multi-Axle</Badge>
                  <Badge variant="neutral">AC Sleeper (2+1)</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Inputs & Selects */}
          <Card hover>
            <CardHeader>
              <CardTitle>Form Controls</CardTitle>
              <CardDescription>Accessible inputs with icons, validation, and focus effects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Departure City"
                placeholder="e.g. Bengaluru, Karnataka"
                leftIcon={MapPin}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="Enter departure city or boarding terminal"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Popular Bus Operator"
                  leftIcon={Bus}
                  options={THEME.popularOperators}
                  defaultValue="Sunrise Travels"
                />
                <Input
                  label="Travel Date"
                  type="date"
                  leftIcon={Calendar}
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>

              <Input
                label="Simulated Input with Error"
                defaultValue="invalid_phone"
                error="Please enter a valid 10-digit Indian mobile number (+91)"
              />
            </CardContent>
          </Card>
        </div>

        {/* Shimmer Skeleton Demo */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div>
              <h2 className="text-xl font-bold text-brand-navy">High-Fidelity Skeleton Loader</h2>
              <p className="text-sm text-brand-muted">Used during bus search queries and lazy data fetching</p>
            </div>
            <Badge variant="neutral">Loading Placeholder</Badge>
          </div>
          <BusCardSkeleton />
        </section>
      </main>

      {/* Modal Dialog Test */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="BusGo Design System Verification"
        description="Phase 1 Foundation Component Test"
      >
        <div className="space-y-4">
          <p className="text-sm text-brand-text">
            All design tokens, atomic UI primitives, and Tailwind configurations have been successfully set up with redBus styling standards.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-success shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <span className="font-bold">Phase 1 Complete: </span>
              Button, Card, Badge, Input, Select, Modal, Skeleton, and Logo components are ready for Phase 2 (Homepage & Responsive Navigation).
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Confirm & Continue
            </Button>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="bg-brand-navy text-white py-6 border-t border-slate-800 text-center text-xs text-gray-400">
        <p>© 2026 BusGo Technologies Inc. Inspired by redBus India. Academic Demonstration Product.</p>
      </footer>
    </div>
  );
}
