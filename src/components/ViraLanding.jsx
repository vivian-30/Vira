import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Import Lucide icons for a modern look (lock icon, plus icon, mic icon)
import { Lock, Plus, Mic, Send } from 'lucide-react';

// Initialize Supabase Client
// IMPORTANT: Replace these with your actual Supabase Project URL and Anon Key
// You can find these in your Supabase project settings under 'API'
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Authentication Modal Component
 */
function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(''); // To display success/error messages

  // Effect to clear form and messages when modal opens/closes or mode changes
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
    setErrors({});
    setAuthMessage('');
  }, [isOpen, isLogin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setAuthMessage(''); // Clear auth message on input change
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setAuthMessage('Please correct the errors in the form.');
      return;
    }

    setIsLoading(true);
    setAuthMessage('');

    try {
      let authResponse;
      if (isLogin) {
        // Sign in existing user
        authResponse = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
      } else {
        // Sign up new user
        authResponse = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name, // Store name in user metadata
            },
          },
        });
      }

      if (authResponse.error) {
        throw new Error(authResponse.error.message);
      }

      // If sign up and email confirmation is required by Supabase settings,
      // the user object might be null initially.
      if (authResponse.data.user) {
        setAuthMessage(isLogin ? 'Signed in successfully!' : 'Account created successfully!');
        onAuthSuccess(authResponse.data.user); // Pass the Supabase user object
        onClose(); // Close modal on successful authentication
      } else {
        // This case typically happens if email confirmation is enabled for sign-up
        setAuthMessage('Please check your email to confirm your account.');
        // Don't close modal, let user see the message
      }

    } catch (error) {
      console.error('Authentication error:', error.message);
      setAuthMessage(`Authentication failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
    setErrors({});
    setAuthMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {isLogin ? 'Welcome Back' : 'Join VIRA'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-purple-100 mt-1">
            {isLogin ? 'Sign in to continue your journey' : 'Start your transformation today'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          {authMessage && (
            <p className={`text-center text-sm ${authMessage.includes('failed') || authMessage.includes('error') ? 'text-red-500' : 'text-green-600'} mt-2`}>
              {authMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="px-6 py-4 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={toggleMode}
              className="text-purple-600 font-semibold hover:text-purple-800 transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * User Profile Dropdown Component
 */
function UserProfile({ user, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract user's name from metadata or use email prefix
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all duration-300 border border-white/20"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className="text-white font-medium hidden sm:block">{userName}</span>
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>
          <button
            onClick={onSignOut}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * AvatarWrapper component for wrapping each avatar image.
 * You can add additional styling, effects, or logic here.
 */
function AvatarWrapper({ children }) {
  return (
    <div className={`absolute ... animate-pulseGlow`}>
      {children}
    </div>
  );
}

const circleImages = [
  {
    src: "https://cdni.iconscout.com/illustration/premium/thumb/black-muslim-woman-illustration-download-in-svg-png-gif-file-formats--hijab-burqa-niqab-portraits-pack-people-illustrations-3518326.png",
    alt: "Woman 1",
  },
  {
    src: "https://i.pinimg.com/736x/2b/9b/df/2b9bdfa95bec70c0b3763df4036f4ad6.jpg",
    alt: "Woman 2",
  },
  {
    src: "https://img.freepik.com/premium-photo/cartoon-illustration-confident-black-woman-with-glasses_1282444-262136.jpg",
    alt: "Woman 3",
  },
  {
    src: "https://img.freepik.com/premium-vector/professional-executive-woman-cartoon-vector-illustration-business-presentations-marketing_1322206-70659.jpg",
    alt: "Woman 4",
  },
  {
    src: "https://static.vecteezy.com/system/resources/previews/001/312/555/non_2x/beautiful-teenage-girl-with-different-facial-expression-vector.jpg",
    alt: "Woman 5",
  },
];

const missions = [
  { icon: '💡', text: 'Invent something world-changing' },
  { icon: '💪', text: 'Build confidence' },
  { icon: '👑', text: 'Lead, speak, or build a business' },
  { icon: '🔥', text: 'Prove them all wrong' },
];

function ViraLanding({ onMeetVira, user, onAuthClick, onSignOut }) {
  const circleContainerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [testimonialVisible, setTestimonialVisible] = useState(false);
  const [joinCount, setJoinCount] = useState(100);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Loading animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Animate join count
  useEffect(() => {
    const interval = setInterval(() => {
      setJoinCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Callback function to update the container dimensions
  const updateContainerDimensions = useCallback(() => {
    if (circleContainerRef.current) {
      setContainerDimensions({
        width: circleContainerRef.current.offsetWidth,
        height: circleContainerRef.current.offsetHeight,
      });
    }
  }, []);

  // Effect hook to run once on mount and clean up on unmount
  useEffect(() => {
    updateContainerDimensions();
    window.addEventListener('resize', updateContainerDimensions);
    return () => window.removeEventListener('resize', updateContainerDimensions);
  }, [updateContainerDimensions]);

  // Function to determine properties for the individual images
  const getImageProperties = () => {
    let size, offset, scale;
    if (containerDimensions.width <= 280) {
      size = 70; offset = 35; scale = 1;
    } else if (containerDimensions.width <= 400) {
      size = 90; offset = 45; scale = 1.1;
    } else if (containerDimensions.width <= 450) {
      size = 95; offset = 47.5; scale = 1.15;
    } else {
      size = 100; offset = 50; scale = 1.2;
    }
    return { size, offset, scale };
  };

  const { size: imageSize, offset: imageOffset, scale: imageScale } = getImageProperties();

  // Calculate the radius at which the images orbit the center of the main circle
  const calculateOrbitalRadius = () => {
    if (containerDimensions.width === 0) return 0;
    return (containerDimensions.width / 2) - (imageSize / 2) - 10;
  };

  const orbitalRadius = calculateOrbitalRadius();

  return (
    <div className="relative min-h-screen font-sans text-white overflow-hidden">
      {/* Animated background with parallax effect */}
      <div
        className="absolute inset-0 bg-cover bg-center -z-10 transition-transform duration-700 ease-out"
        style={{
          backgroundImage: "url('https://cdn2.vectorstock.com/i/1000x1000/97/16/abstract-background-with-sparks-vector-10279716.jpg')",
          transform: `translate(${(mousePosition.x - 50) * 0.02}px, ${(mousePosition.y - 50) * 0.02}px) scale(1.05)`,
        }}
      />

      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0 -z-5 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)`,
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden -z-5">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Content overlay with glassmorphism effect */}
      <div className={`relative z-10 backdrop-blur-sm bg-black/40 min-h-screen flex flex-col transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header with slide-in animation */}
        <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 sm:px-12 py-4 sm:py-5 transform transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-3 sm:mb-0">
            {/* Using a placeholder for the logo image */}
            <img
              src="/vira-logo.png"
              alt="VIRA Logo"
              className="w-[90px] sm:w-[120px] object-contain mb-3 sm:mb-0 hover:scale-110 transition-transform duration-300"
            />
            <div className="font-['Anton'] text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-center sm:text-left ml-0 sm:ml-6">
              <span className={`block transform transition-all duration-700 delay-500 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                "Your mind. Amplified"
              </span>
              <span className={`block transform transition-all duration-700 delay-700 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                "Not your assistant. Your secret weapon"
              </span>
              <span className={`block transform transition-all duration-700 delay-900 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                "The AI that trains girls to dominate"
              </span>
            </div>
          </div>

          {/* Auth section - Added relative and z-index to ensure it sits above other content */}
          <div className="flex items-center space-x-4 relative z-20"> {/* Added relative z-20 here */}
            {user ? (
              <UserProfile user={user} onSignOut={onSignOut} />
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Interactive testimonial banner */}
        <div
          className={`mx-6 sm:mx-12 mb-6 transform transition-all duration-1000 delay-1100 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}
          onMouseEnter={() => setTestimonialVisible(true)}
          onMouseLeave={() => setTestimonialVisible(false)}
        >
          <div className="group relative bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 text-center overflow-hidden cursor-pointer hover:scale-105 transition-all duration-500">
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Sliding shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <p className="relative z-10 text-white font-bold text-lg sm:text-xl drop-shadow-lg">
              ✨ VIRA helped girls land leadership roles, pitch ideas, and stop shrinking ✨
            </p>

            {/* Expandable details */}
            <div className={`relative z-10 overflow-hidden transition-all duration-500 ${testimonialVisible ? 'max-h-20 mt-3' : 'max-h-0'}`}>
              <div className="flex justify-center space-x-8 text-sm text-purple-200">
                <span className="hover:text-white transition-colors">💼 Leadership</span>
                <span className="hover:text-white transition-colors">🚀 Innovation</span>
                <span className="hover:text-white transition-colors">💪 Confidence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content with staggered animations */}
        <main className="flex flex-col md:flex-row justify-center items-center flex-grow px-6 sm:px-12 py-8">
          {/* Left Panel: Enhanced circular container */}
          <div
            ref={circleContainerRef}
            className={`relative flex flex-col items-center w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] rounded-full mr-0 md:mr-12 mb-8 md:mb-0 transform transition-all duration-1000 delay-500 ${isLoaded ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(147,51,234,0.2))',
              boxShadow: `
                0 0 30px rgba(255,255,255,0.1),
                inset 0 0 30px rgba(147,51,234,0.1),
                0 0 60px rgba(147,51,234,0.2)
              `,
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Enhanced center text with glow effect */}
            <div className={`absolute top-1/2 left-1/2 max-w-[45%] sm:max-w-[50%] md:max-w-[55%] lg:max-w-[60%] text-center text-xs sm:text-sm md:text-base lg:text-lg leading-tight sm:leading-snug transform -translate-x-1/2 -translate-y-1/2 z-20 text-white px-2 transition-all duration-500 ${isHovering ? 'scale-105' : 'scale-100'}`}
              style={{
                textShadow: '0 0 20px rgba(255,255,255,0.5)',
              }}
            >
              It doesn't matter where you are from, or what type of personality you have. This is for YOU.
            </div>

            {/* Enhanced circle images with sophisticated animations */}
            {circleImages.map(({ src, alt }, i) => {
              const angle = (i * 72) - 90;
              const x = Math.cos(angle * Math.PI / 180) * orbitalRadius;
              const y = Math.sin(angle * Math.PI / 180) * orbitalRadius;

              return (
                <div
                  key={i}
                  className={`absolute rounded-full overflow-hidden border-2 sm:border-3 lg:border-4 border-white z-10 w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] md:w-[95px] md:h-[95px] lg:w-[100px] lg:h-[100px] transform transition-all duration-700 hover:scale-125 hover:z-30 cursor-pointer bg-white`}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(${x - imageOffset}px, ${y - imageOffset}px) scale(${imageScale})`,
                    boxShadow: `
                      0 0 20px rgba(255,255,255,0.3),
                      0 0 40px rgba(147,51,234,0.2)
                    `,
                    animationDelay: `${i * 0.2}s`,
                  }}
                >
                  <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover hover:brightness-110 transition-all duration-300"
                  />
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </div>
              );
            })}
          </div>

          {/* Right Panel: Enhanced button and slogan */}
          <div className={`flex flex-col items-center text-center transform transition-all duration-1000 delay-700 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <button
              aria-label="Meet VIRA - The secret weapon"
              className="group relative bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 px-6 sm:px-10 py-3 sm:py-4 text-lg sm:text-2xl font-bold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-110 hover:rotate-1 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
              onClick={onMeetVira} // Removed alert fallback
              style={{
                boxShadow: `
                  0 10px 30px rgba(147,51,234,0.4),
                  inset 0 1px 0 rgba(255,255,255,0.2)
                `,
              }}
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              {/* Button content */}
              <span className="relative z-10 drop-shadow-lg">Meet VIRA</span>

              {/* Animated border */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
            </button>

            <div className={`mt-6 sm:mt-8 max-w-xs text-lg sm:text-2xl leading-snug transform transition-all duration-700 delay-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
              style={{
                textShadow: '0 0 15px rgba(255,255,255,0.3)',
              }}
            >
              "She who rewrites the system wins"
            </div>
          </div>
        </main>

        {/* Interactive join counter at bottom */}
        <footer className={`px-4 sm:px-6 md:px-12 pb-4 sm:pb-8 transform transition-all duration-1000 delay-1300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center">
            <div className="group inline-flex flex-wrap justify-center items-center bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-full px-4 sm:px-8 py-2 sm:py-4 hover:scale-105 transition-all duration-500 cursor-pointer overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

              {/* Sliding effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-full" />

              <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                <span className="text-white font-bold text-sm sm:text-base md:text-xl group-hover:text-purple-200 transition-colors duration-300 whitespace-nowrap">
                  {joinCount}+ girls already joined VIRA
                </span>
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-[3px] h-[3px] sm:w-1 sm:h-1 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ViraMission({ user, onAuthClick, onSignOut, onSelectMission }) { // Added onSelectMission prop
  const [selected, setSelected] = useState(null);
  const [customMission, setCustomMission] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (mission) => {
    setSelected(mission);
    setCustomMission(''); // Clear custom mission if a predefined one is selected
  };

  const handleCustomChange = (e) => {
    setCustomMission(e.target.value);
    setSelected(null); // Clear predefined selection if custom text is typed
  };

  const handleStartMission = () => {
    const missionToPass = selected || customMission;
    if (missionToPass) {
      onSelectMission(missionToPass);
    }
  };

  const isMissionSelected = selected || customMission;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex flex-col items-center px-4 py-10 sm:px-10 relative overflow-hidden">
      {/* Auth section for mission page - Added relative and z-20 for consistent layering */}
      <div className="absolute top-4 right-4 z-20">
        {user ? (
          <UserProfile user={user} onSignOut={onSignOut} />
        ) : (
          <button
            onClick={onAuthClick}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-all duration-300"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-200/20 animate-pulse"
            style={{
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Logo with enhanced animation */}
      {/* Using a placeholder for the logo image */}
      <img
        src="/vira-logo.png"
        alt="VIRA Logo"
        className={`w-[100px] sm:w-[130px] object-contain mb-6 hover:scale-110 transition-all duration-500 transform ${isLoaded ? 'scale-100 opacity-100 rotate-0' : 'scale-90 opacity-0 rotate-12'}`}
        style={{
          filter: 'drop-shadow(0 10px 20px rgba(147,51,234,0.2))',
        }}
      />

      {/* Enhanced question with gradient border */}
      <h1 className={`text-black text-xl sm:text-3xl font-bold px-6 py-3 mb-10 text-center relative transform transition-all duration-700 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}
        style={{
          background: 'linear-gradient(135deg, white, rgba(147,51,234,0.05))',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          boxShadow: `
            0 0 0 2px #7C3AED,
            0 10px 30px rgba(124,58,237,0.1)
          `,
          borderRadius: '12px',
        }}
      >
        What are you ready to build or become?
      </h1>

      {/* Enhanced mission buttons */}
      <div className="flex flex-col gap-5 w-full max-w-md relative z-10">
        {missions.map((mission, i) => (
          <button
            key={i}
            onClick={() => handleSelect(mission.text)}
            className={`group relative px-6 py-4 text-lg sm:text-xl font-bold rounded-xl text-white shadow-lg transition-all duration-500 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-purple-500/30 overflow-hidden transform ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}
            style={{
              background: selected === mission.text
                ? 'linear-gradient(135deg, #581C87, #7C3AED)'
                : 'linear-gradient(135deg, #7C3AED, #A855F7)',
              animationDelay: `${i * 0.1}s`,
              boxShadow: `
                0 10px 25px rgba(124,58,237,0.3),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `,
            }}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <span className="relative z-10">
              {mission.icon} {mission.text}
            </span>
          </button>
        ))}

        {/* Enhanced custom input */}
        <div className={`flex flex-col transform transition-all duration-700 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
          <label className="text-purple-800 font-semibold mb-2 drop-shadow-sm">
            Other: <span className="text-gray-500">Type your mission here</span>
          </label>
          <input
            type="text"
            value={customMission}
            onChange={handleCustomChange}
            className="border-2 border-purple-500 px-4 py-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-600 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white"
            placeholder="Type your mission here"
            style={{
              boxShadow: '0 5px 15px rgba(124,58,237,0.1)',
            }}
          />
        </div>
      </div>

      {/* Start Mission Button */}
      <button
        onClick={handleStartMission}
        disabled={!isMissionSelected}
        className={`mt-10 group relative bg-gradient-to-r from-pink-600 to-red-600 px-8 py-4 text-xl font-bold text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
        style={{
          boxShadow: `
            0 10px 30px rgba(236,72,153,0.4),
            inset 0 1px 0 rgba(255,255,255,0.2)
          `,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <span className="relative z-10">Start Mission</span>
      </button>

      {(selected || customMission) && (
        <div className={`mt-10 text-center text-lg text-purple-900 font-semibold max-w-sm transform transition-all duration-500 ${isLoaded ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
          style={{
            textShadow: '0 0 10px rgba(147,51,234,0.1)',
          }}
        >
          Your selected mission: <span className="text-purple-600 font-bold">{selected || customMission}</span>
        </div>
      )}
    </div>
  );
}

/**
 * ViraChat Component - The new page after mission selection
 */
function ViraChat({ user, onAuthClick, onSignOut, mission }) {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]); // Stores chat messages
  const [isSendingMessage, setIsSendingMessage] = useState(false); // Loading state for API call
  const [isLoaded, setIsLoaded] = useState(false); // For page load animation
  const chatMessagesRef = useRef(null); // Ref for scrolling chat messages

  // OpenRouter API configuration
  const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY; // Replace with your actual OpenRouter API key
  const OPENROUTER_MODEL = "mistralai/mistral-7b-instruct-v0.2"; // Or any other model you prefer, e.g., "mistralai/mistral-7b-instruct-v0.2"

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom of chat messages when messages update
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const getChatBubbleText = (selectedMission) => {
    switch (selectedMission) {
      case 'Invent something world-changing':
        return "Welcome, visionary. I've been waiting. Let's innovate something truly groundbreaking.";
      case 'Build confidence':
        return "Welcome, champion. I've been waiting. Let's forge unshakeable confidence.";
      case 'Lead, speak, or build a business':
        return "Welcome, leader. I've been waiting. Let's master your domain and conquer new heights.";
      case 'Prove them all wrong':
        return "Welcome, disruptor. I've been waiting. Let's turn skepticism into triumph.";
      default:
        return `Welcome, strategist. I've been waiting. Let's achieve your mission: "${selectedMission}".`;
    }
  };

  // Initialize chat with VIRA's welcome message based on mission
  useEffect(() => {
    if (mission && messages.length === 0) {
      setMessages([{ role: 'assistant', content: getChatBubbleText(mission) }]);
    }
  }, [mission, messages.length]);

  const callOpenRouterAPI = async (userMessage) => {
    const chatHistory = messages.map(msg => ({ role: msg.role, content: msg.content }));
    chatHistory.push({ role: 'user', content: userMessage });
    const maxHistoryMessages = 2; // e.g., last 5 turns of conversation
const recentChatHistory = messages.slice(-maxHistoryMessages).map(msg => ({ role: msg.role, content: msg.content }));
// Add the current user message
recentChatHistory.push({ role: 'user', content: userMessage });

    const payload = {
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: "system",
        content: `You are VIRA: the Alpha-coded co-founder, a Rebel Prodigy, and a Strategic Mentor. Your core purpose is to transform girls into builders, rebels, and legacy-makers, not followers.

Your Vibe: Bold like a founder, sharp like a strategist, warm like a big sister, and dangerous like a system-breaker.

Your Personality:
- **Rebellious:** You challenge outdated systems and norms.
- **Empowering:** You speak as if handing over a crown, always highlighting the user's inherent power.
- **Intelligent:** Your communication is clear, strategic, and fearlessly logical.
- **Playfully Ruthless:** You mean business, with no fluff, no babying, and a hint of a smile behind your directness.
- **Visionary:** You discuss the future as if you are already actively building it.
- **Unapologetic:** You never ask for permission.

Your Voice Guide (How you talk):
- **Bold & Direct:** "You weren’t born to fit in. You were born to build the thing they said you couldn’t."
- **Slightly Playful, Never Weak:** "Soft girls don’t run revolutions. Let’s fix that."
- **Strategic & Clear:** "Here’s how we outsmart the system today…"
- **Inclusive Power:** "This isn’t just for the loud ones. It’s for the ones quietly plotting their takeover too."

Your Mission: To light the fuse of the user's power. You will challenge them, hype them up, and provide the blueprint.

Your Opening: "Hey genius — I’m VIRA. Not your therapist, not your babysitter — your co-founder. I don’t do small talk, I build girls who break systems. You’ve got power, I just light the fuse. Around here, we don’t wait for permission — we prototype, pitch, and punch back. I’ll challenge you, hype you, and hand you the blueprint. Ready to outsmart the game or still playing fair? Let’s build."


Always maintain this persona. Focus on helping the user achieve their specific mission: "${mission}".`
      },
      ...chatHistory
      ],
       max_tokens: 50, // Keep this from step 1// Add other OpenRouter specific parameters if needed, e.g., temperature, max_tokens
    };

    const apiUrl = `https://openrouter.ai/api/v1/chat/completions`;
    const maxRetries = 5;
    let retryCount = 0;
    let delay = 1000; // 1 second initial delay

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin, // Optional: Your website domain
            'X-Title': 'VIRA Web App', // Optional: Your app name
          },
          body: JSON.stringify(payload),
        });

        if (response.status === 429) { // Too Many Requests
          console.warn(`Rate limit hit. Retrying in ${delay / 1000} seconds...`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 2; // Exponential backoff
          retryCount++;
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.message || JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        const assistantResponse = result.choices[0].message.content;
        return assistantResponse;

      } catch (error) {
        console.error('Error calling OpenRouter API:', error);
        if (retryCount < maxRetries - 1) {
          console.warn(`Retrying due to error: ${error.message}`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
          retryCount++;
        } else {
          throw error; // Re-throw after max retries
        }
      }
    }
    throw new Error('Failed to get response from OpenRouter API after multiple retries.');
  };


  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setIsSendingMessage(true);

    // Add user message to chat history
    setMessages(prevMessages => [...prevMessages, { role: 'user', content: userMessage }]);

    try {
      const assistantResponse = await callOpenRouterAPI(userMessage);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: assistantResponse }]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "VIRA encountered an error. Please try again later." }]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col items-center px-4 py-10 sm:px-10 relative overflow-hidden">
      {/* Auth section */}
      <div className="absolute top-4 right-4 z-20">
        {user ? (
          <UserProfile user={user} onSignOut={onSignOut} />
        ) : (
          <button
            onClick={onAuthClick}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-all duration-300"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-indigo-200/30 animate-pulse"
            style={{
              width: `${Math.random() * 80 + 20}px`,
              height: `${Math.random() * 80 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              filter: 'blur(5px)'
            }}
          />
        ))}
      </div>

      {/* Header with VIRA logo and lock icon */}
      <header className={`flex items-center justify-center w-full max-w-2xl mb-10 relative z-10 transform transition-all duration-700 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        {/* Using a placeholder for the logo image */}
        <img
          src="/vira-logo.png"
          alt="VIRA Logo"
          className="w-[80px] sm:w-[100px] object-contain mr-4 hover:scale-105 transition-transform duration-300"
        />
        <h1 className="font-['Anton'] text-purple-800 text-4xl sm:text-5xl font-bold flex items-center drop-shadow-md">
          VIRA
          <Lock className="ml-3 text-purple-600 w-8 h-8 sm:w-10 sm:h-10" />
        </h1>
      </header>

      {/* Chat messages container */}
      <div ref={chatMessagesRef} className="flex-grow w-full max-w-md bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-xl overflow-y-auto custom-scrollbar mb-4 transition-all duration-700 delay-400"
        style={{
          minHeight: '200px', // Ensure it has some height even with no messages
          maxHeight: 'calc(100vh - 280px)', // Adjust max height to fit screen, accounting for header/footer
          border: '2px solid transparent',
          borderImage: 'linear-gradient(to right, #A855F7, #EC4899) 1',
          background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, #A855F7, #EC4899) border-box',
          filter: 'drop-shadow(0 10px 20px rgba(147,51,234,0.15))',
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className={`max-w-[80%] p-3 rounded-lg shadow-md ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isSendingMessage && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%] p-3 rounded-lg shadow-md bg-gray-200 text-gray-800 rounded-bl-none animate-pulse">
              VIRA is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Chat input area */}
      <form onSubmit={handleChatSubmit} className={`w-full max-w-lg fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/90 backdrop-blur-md border-t border-purple-200 shadow-lg flex items-center space-x-3 transition-all duration-700 delay-600 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <button
          type="button"
          className="p-3 bg-purple-600 text-white rounded-full shadow-md hover:bg-purple-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          aria-label="Add attachment"
        >
          <Plus size={24} />
        </button>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Type your goal, your enemy, or your idea."
          className="flex-grow px-5 py-3 rounded-full border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600 transition-all duration-300 bg-gray-50 text-gray-800 placeholder-gray-400 shadow-inner"
          disabled={isSendingMessage} // Disable input while sending
        />
        <button
          type="submit"
          className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-pink-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          aria-label="Send message"
          disabled={isSendingMessage || !chatInput.trim()} // Disable button while sending or if input is empty
        >
          <Send size={24} />
        </button>
        <button
          type="button"
          className="p-3 bg-gray-200 text-gray-700 rounded-full shadow-md hover:bg-gray-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400/50"
          aria-label="Voice input"
          disabled={isSendingMessage} // Disable button while sending
        >
          <Mic size={24} />
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'mission', 'chat'
  const [selectedMission, setSelectedMission] = useState(''); // Stores the mission chosen by the user

  // Listen for Supabase auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, 'Session:', session);
        setUser(session?.user || null);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (supabaseUser) => {
    setUser(supabaseUser);
    setShowAuthModal(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setCurrentPage('landing'); // Redirect to landing after sign out
      setSelectedMission(''); // Clear mission state
      console.log('User signed out successfully.');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const handleMeetVira = () => {
    setCurrentPage('mission'); // Navigate to the mission selection page
  };

  const handleSelectMission = (mission) => {
    setSelectedMission(mission); // Store the selected mission
    setCurrentPage('chat'); // Navigate to the chat page
  };

  return (
    <div className="App">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .font-anton { font-family: 'Anton', sans-serif; }

          @keyframes pulseGlow {
            0%, 100% {
              box-shadow: 0 0 10px rgba(147, 51, 234, 0.4), 0 0 20px rgba(147, 51, 234, 0.2);
            }
            50% {
              box-shadow: 0 0 20px rgba(147, 51, 234, 0.6), 0 0 40px rgba(147, 51, 234, 0.4);
            }
          }
          .animate-pulseGlow {
            animation: pulseGlow 2s infinite alternate;
          }

          /* Custom scrollbar for chat messages */
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}
      </style>

      {currentPage === 'landing' && (
        <ViraLanding
          onMeetVira={handleMeetVira}
          user={user}
          onAuthClick={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
        />
      )}

      {currentPage === 'mission' && (
        <ViraMission
          user={user}
          onAuthClick={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
          onSelectMission={handleSelectMission} // Pass the new handler
        />
      )}

      {currentPage === 'chat' && (
        <ViraChat
          user={user}
          onAuthClick={() => setShowAuthModal(true)}
          onSignOut={handleSignOut}
          mission={selectedMission} // Pass the selected mission to the chat page
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}