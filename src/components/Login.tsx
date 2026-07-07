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
  const bgOrb1 = useRef<HTMLDivElement>(null);
  const bgOrb2 = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !formRef.current) return;

    const ctx = gsap.context(() => {
      // Background Grid perspective effect
      gsap.fromTo(gridRef.current,
        { opacity: 0, scale: 1.5, rotationX: 45 },
        { opacity: 0.15, scale: 1, rotationX: 20, duration: 2, ease: 'power3.out' }
      );

      // Ambient Orbs Floating
      gsap.to(bgOrb1.current, {
        x: 'random(-50, 50)',
        y: 'random(-50, 50)',
        rotation: 360,
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to(bgOrb2.current, {
        x: 'random(-50, 50)',
        y: 'random(-50, 50)',
        rotation: -360,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Card 3D Entrance
      gsap.fromTo(formRef.current,
        { y: 60, opacity: 0, scale: 0.9, rotationX: 10, backdropFilter: 'blur(0px)' },
        { y: 0, opacity: 1, scale: 1, rotationX: 0, backdropFilter: 'blur(24px)', duration: 1.2, delay: 0.3, ease: 'expo.out' }
      );

      // Staggered contents
      gsap.fromTo('.stagger-item',
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, delay: 0.6, ease: 'back.out(1.2)' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      gsap.to('.google-btn', { scale: 0.92, duration: 0.15, yoyo: true, repeat: 1 });
      
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        gsap.to(formRef.current, {
          y: -50,
          opacity: 0,
          scale: 0.95,
          duration: 0.6,
          ease: 'power3.in',
          onComplete: () => navigate('/')
        });
      }
    } catch (error) {
      console.error('Login failed', error);
      gsap.fromTo(formRef.current, 
        { x: -12, rotationY: -5 }, 
        { x: 12, rotationY: 5, duration: 0.1, yoyo: true, repeat: 5, ease: 'linear', onComplete: () => gsap.set(formRef.current, { x: 0, rotationY: 0 }) }
      );
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center bg-[#020108] overflow-hidden text-gray-100" style={{ perspective: '1000px' }}>
      
      {/* Premium Dark Grid Background */}
      <div 
        ref={gridRef}
        className="absolute inset-0 z-0 opacity-15"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transformOrigin: 'center top'
        }}
      />

      {/* Dynamic Floating Ambient Orbs */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none mix-blend-screen">
        <div ref={bgOrb1} className="absolute w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px]" />
        <div ref={bgOrb2} className="absolute w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[150px] translate-x-32" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020108]/50 via-transparent to-[#020108] pointer-events-none" />
      </div>

      {/* Premium Glassmorphic Login Card */}
      <div 
        ref={formRef}
        className="relative z-10 w-full max-w-sm p-10 mx-4 rounded-[2.5rem] border border-white/10 bg-[#0a0814]/60 backdrop-blur-2xl shadow-[0_40px_80px_-20px_rgba(79,70,229,0.2)] flex flex-col items-center text-center overflow-hidden"
      >
        {/* Subtle top glare */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        
        <div className="stagger-item mb-8 relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150" />
          <AcadlyLogo className="w-16 h-16 relative z-10" />
        </div>
        
        <h1 className="stagger-item text-3xl font-extrabold tracking-tight mb-3 text-white">
          Welcome to Acadly
        </h1>
        <p className="stagger-item text-sm text-gray-400 mb-10 font-medium">
          Your AI-powered study companion.
        </p>

        <button
          onClick={handleGoogleSignIn}
          className="google-btn stagger-item group relative w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-slate-900 px-6 py-4 rounded-2xl font-bold transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 overflow-hidden"
        >
          {/* Shine effect on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
          
          <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="relative z-10">Continue with Google</span>
        </button>

        <div className="stagger-item mt-8 text-[10px] text-gray-500 font-bold tracking-[0.2em] opacity-70 uppercase">
          Secure Encrypted Sign In
        </div>
      </div>
    </div>
  );
}
