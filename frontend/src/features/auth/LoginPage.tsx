import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const MiniGlobe = lazy(() => import('./MiniGlobe').then(m => ({ default: m.MiniGlobe })));

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // No auth yet — go straight to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row" style={{ background: 'var(--color-void)' }}>
      {/* ── Left: Form Panel ── */}
      <motion.div
        className="relative z-10 flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-12 md:px-16 lg:px-20 py-10 lg:py-0"
        style={{
          background: 'var(--glass-strong-bg)',
          backdropFilter: 'blur(40px)',
          borderRight: '1px solid var(--color-border-subtle)',
        }}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="w-full max-w-[400px] mx-auto">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 mb-12"
            variants={stagger.item}
            initial="initial"
            animate="animate"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(196, 154, 68, 0.15), rgba(196, 154, 68, 0.05))',
                border: '1px solid rgba(196, 154, 68, 0.2)',
              }}
            >
              <span className="text-[16px] font-bold" style={{ color: 'var(--color-accent-gold)' }}>T</span>
            </div>
            <span
              className="text-[18px] font-semibold text-text-primary"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Time Scroll
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div variants={stagger.container} initial="initial" animate="animate">
            <motion.h1
              className="text-text-primary mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700 }}
              variants={stagger.item}
            >
              Welcome back
            </motion.h1>
            <motion.p
              className="text-text-secondary mb-10"
              style={{ fontSize: '15px', lineHeight: 1.6 }}
              variants={stagger.item}
            >
              Sign in to continue your journey through history
            </motion.p>

            {/* Form */}
            <motion.form onSubmit={handleSignIn} variants={stagger.item}>
              {/* Email */}
              <div className="mb-4">
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="explorer@timescroll.com"
                    className="w-full h-[48px] pl-11 pr-4 rounded-xl text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-200 focus:ring-2 focus:ring-accent-gold/30"
                    style={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--color-border-subtle)',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-6">
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[48px] pl-11 pr-11 rounded-xl text-[14px] text-text-primary placeholder:text-text-muted outline-none transition-all duration-200 focus:ring-2 focus:ring-accent-gold/30"
                    style={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--color-border-subtle)',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md cursor-pointer text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    className="text-[12px] text-text-muted hover:text-accent-gold transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Sign In button */}
              <motion.button
                type="submit"
                className="w-full h-[50px] rounded-xl font-semibold cursor-pointer flex items-center justify-center gap-2"
                style={{
                  fontSize: '15px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: 'linear-gradient(135deg, #c49a44 0%, #a07830 100%)',
                  color: '#08080c',
                  fontWeight: 600,
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(196, 154, 68, 0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In
                <ArrowRight size={16} strokeWidth={2.5} />
              </motion.button>
            </motion.form>

            {/* Divider */}
            <motion.div className="flex items-center gap-3 my-6" variants={stagger.item}>
              <div className="flex-1 h-px bg-border-subtle" />
              <span className="text-[11px] text-text-muted uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                or
              </span>
              <div className="flex-1 h-px bg-border-subtle" />
            </motion.div>

            {/* Continue as guest */}
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="w-full h-[46px] rounded-xl font-medium cursor-pointer flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
              style={{
                fontSize: '14px',
                fontFamily: "'Space Grotesk', sans-serif",
                background: 'var(--glass-bg)',
                border: '1px solid var(--color-border-subtle)',
              }}
              whileHover={{ scale: 1.01, borderColor: 'var(--color-border-active)' }}
              whileTap={{ scale: 0.99 }}
              variants={stagger.item}
            >
              Continue as Guest
            </motion.button>

            {/* Sign up link */}
            <motion.p
              className="text-center mt-8 text-[13px] text-text-muted"
              variants={stagger.item}
            >
              Don't have an account?{' '}
              <button
                className="text-accent-gold hover:underline cursor-pointer font-medium"
                onClick={() => {/* Future: navigate to signup */}}
              >
                Sign up
              </button>
            </motion.p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-[10px] text-text-muted" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Journey through 12,000 years of civilization
          </p>
        </div>
      </motion.div>

      {/* ── Right: Interactive Globe ── */}
      <motion.div
        className="relative w-full lg:w-1/2 h-[30vh] lg:h-full overflow-hidden"
        style={{ background: 'var(--color-void)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
      >
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
            </div>
          }
        >
          <MiniGlobe />
        </Suspense>

        {/* Subtle gradient overlay at the edge where globe meets form */}
        <div
          className="absolute inset-y-0 left-0 w-16 pointer-events-none hidden lg:block"
          style={{ background: 'linear-gradient(to right, var(--glass-strong-bg), transparent)' }}
        />
        <div
          className="absolute inset-x-0 top-0 h-8 pointer-events-none lg:hidden"
          style={{ background: 'linear-gradient(to bottom, var(--glass-strong-bg), transparent)' }}
        />
      </motion.div>
    </div>
  );
}
