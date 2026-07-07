import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import AcadlyLogo from './AcadlyLogo';

export default function Login() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !formRef.current) return;

    // Entrance Animation
    const ctx = gsap.context(() => {
      gsap.fromTo('.login-bg', 
        { scale: 1.1, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 1.5, ease: 'power3.out' }
      );
      
      gsap.fromTo(formRef.current,
        { y: 30, opacity: 0, backdropFilter: 'blur(0px)' },
        { y: 0, opacity: 1, backdropFilter: 'blur(16px)', duration: 1, delay: 0.2, ease: 'power3.out' }
      );

      gsap.fromTo('.stagger-item',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.4, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      // Button click animation
      gsap.to('.google-btn', { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
      
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        // Exit animation
        gsap.to(formRef.current, {
          y: -30,
          opacity: 0,
          duration: 0.5,
          ease: 'power3.in',
          onComplete: () => navigate('/')
        });
      }
    } catch (error) {
      console.error('Login failed', error);
      // Shake animation on error
      gsap.fromTo(formRef.current, 
        { x: -10 }, 
        { x: 10, duration: 0.1, yoyo: true, repeat: 5, onComplete: () => gsap.set(formRef.current, { x: 0 }) }
      );
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center bg-[#030207] overflow-hidden text-gray-100">
      {/* Ambient Animated Background */}
      <div className="login-bg absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent opacity-50" />
      </div>

      {/* Login Card - Vertically Compact */}
      <div 
        ref={formRef}
        className="relative z-10 w-full max-w-sm p-8 mx-4 rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] flex flex-col items-center text-center"
      >
        <div className="stagger-item mb-6">
          <AcadlyLogo className="w-14 h-14" />
        </div>
        
        <h1 className="stagger-item text-2xl font-bold tracking-tight mb-2 text-white">
          Welcome to Acadly
        </h1>
        <p className="stagger-item text-sm text-gray-400 mb-8">
          Your AI-powered study companion.
        </p>

        <button
          onClick={handleGoogleSignIn}
          className="google-btn stagger-item group relative w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-slate-800 px-6 py-3.5 rounded-2xl font-semibold transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
          <div className="absolute inset-0 rounded-2xl border border-black/5 pointer-events-none group-hover:border-black/10 transition-colors" />
        </button>

        <div className="stagger-item mt-6 text-xs text-gray-500 font-medium tracking-wide opacity-80">
          SECURE SIGN IN
        </div>
      </div>
    </div>
  );
}
