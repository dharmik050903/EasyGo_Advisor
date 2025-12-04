import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, User, Calendar, MessageCircle, Globe, GraduationCap, FileText, Shield, Target, CheckCircle, HeartHandshake, TrendingUp, Calendar as CalendarIcon, CheckCircle2, BarChart3, ClipboardCheck, FileCheck, UserCheck, Building2, Home, Briefcase, BriefcaseBusiness, Users, Award, BookOpen, Lightbulb, Ticket, Globe2, BadgeCheck, Plane, Users2, Search, FileSearch, CalendarCheck, LayoutGrid } from 'lucide-react';
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CryptoJS from "crypto-js";

// =============================================================================
// MODEL LAYER - Data structures and validation logic
// =============================================================================

/**
 * Form data model - defines the structure of appointment booking form
 */
// Get SECRET_KEY from environment variables, fallback to default for development
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || "EasyGoAdvisor@1974";
const isProduction = process.env.NODE_ENV === "production"; // Detect environment
// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const initialFormData = {
  name: '',
  email: '',
  phone: '',
  state: '',
  service: '',
  preferredDate: '',
  message: '',
  // Eligibility fields (optional)
  englishLevel: '',
  age: '',
  education: '',
  experience: '',
  visaType: ''
};

/**
 * Validation rules for form fields
 * This ensures data integrity and security
 */
const validateForm = (data) => {
  const errors = {};

  // Name validation - only letters and spaces, 2-50 characters
  if (!data.name.trim()) {
    errors.name = 'Name is required';
  } else if (!/^[a-zA-Z\s]{2,50}$/.test(data.name.trim())) {
    errors.name = 'Name must contain only letters and spaces (2-50 characters)';
  }

  // Email validation - proper email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone validation - numbers, spaces, hyphens, parentheses allowed
  const phoneRegex = /^[\d\s\-\(\)\+]{10,15}$/;
  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!phoneRegex.test(data.phone.trim())) {
    errors.phone = 'Please enter a valid phone number (10-15 digits)';
  }

  // Service selection validation
  if (!data.service) {
    errors.service = 'Please select a service';
  }

  // Eligibility fields validation (now required)
  if (!data.englishLevel) {
    errors.englishLevel = 'English level is required';
  }
  if (!data.age) {
    errors.age = 'Age is required';
  }
  if (!data.education) {
    errors.education = 'Education is required';
  }
  if (!data.experience) {
    errors.experience = 'Experience is required';
  }
  if (!data.visaType) {
    errors.visaType = 'Visa type is required';
  }

  // Date validation - must be today or future date
  if (!data.preferredDate) {
    errors.preferredDate = 'Please select a preferred date';
  } else {
    const selectedDate = new Date(data.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.preferredDate = 'Please select future date';
    }
  }

  // Message validation - optional but if provided, limit length
  if (data.message && data.message.length > 500) {
    errors.message = 'Message must be less than 500 characters';
  }

  return errors;
};

/**
 * Security function to sanitize input data
 * Prevents XSS attacks by removing potentially harmful characters
 */
const sanitizeInput = (value) => {
  return value.replace(/[<>\"']/g, '');
};

// =============================================================================
// VIEW LAYER - UI Components
// =============================================================================

/**
 * Header Component - Navigation bar with company branding
 */
const Header = ({ activeSection, setActiveSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollPosition > 50);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset scroll state when activeSection changes to ensure header stays transparent
  useEffect(() => {
    setIsScrolled(false);
    // Check scroll position after a brief delay to allow for any scroll animations
    const timer = setTimeout(() => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollPosition > 50);
    }, 100);
    return () => clearTimeout(timer);
  }, [activeSection]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false); // Close mobile menu when navigation item is clicked
  };

  const handleLogoClick = () => {
    setActiveSection('home');
    setIsMobileMenuOpen(false); // Close mobile menu when logo is clicked
  };

  // Check if we're on sections that need transparent header
  const needsTransparentHeader = activeSection === 'home' || activeSection === 'about-us' || activeSection === 'our-services';

  // Determine text color based on scroll and background
  // When scrolled down or on contact page, use black text
  // When at top of pages with dark backgrounds, use white text
  const useLightText = needsTransparentHeader && !isScrolled;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${needsTransparentHeader && !isScrolled
      ? 'bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg'
      : 'bg-white shadow-lg'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full flex justify-between items-center py-4">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center hover-scale transition-all-smooth cursor-pointer focus:outline-none"
            aria-label="Go to home page"
          >
            <img
              src="/Logo.jpg"
              alt="Easy Go Overseas Logo"
              className="h-8 sm:h-10 md:h-12 w-auto object-contain transition-all-smooth"
              style={{ maxHeight: '48px', objectFit: 'contain', filter: useLightText ? 'brightness(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
            />
          </button>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex space-x-4 lg:space-x-8 items-center">
            {['Home', 'About Us', 'Our Services', 'Contact Us'].map((item) => {
              const isActive = activeSection === item.toLowerCase().replace(' ', '-');
              return (
                <button
                  key={item}
                  onClick={() => setActiveSection(item.toLowerCase().replace(' ', '-'))}
                  className={`font-sans text-sm md:text-base lg:text-lg font-medium transition-all duration-300 relative px-3 py-2 rounded-lg group ${isActive
                    ? useLightText
                      ? 'text-white bg-white/10 backdrop-blur-sm shadow-sm'
                      : 'text-red-600 bg-red-50 shadow-sm'
                    : useLightText
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                >
                  {item}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 transform origin-left transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    } ${useLightText ? 'bg-yellow-400' : 'bg-red-600'}`}></span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className={`transition-colors duration-200 p-1 ${useLightText ? 'text-white hover:text-yellow-300' : 'text-black hover:text-red-600'
                }`}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-slide-down">
            <div className={`px-2 sm:px-3 pt-2 pb-3 space-y-1 rounded-b-lg ${useLightText
              ? 'bg-white/20 backdrop-blur-md border-t border-white/20'
              : 'bg-white border-t border-gray-200'
              }`}>
              {['Home', 'About Us', 'Our Services', 'Contact Us'].map((item) => {
                const isActive = activeSection === item.toLowerCase().replace(' ', '-');
                return (
                  <button
                    key={item}
                    onClick={() => handleNavClick(item.toLowerCase().replace(' ', '-'))}
                    className={`block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-md text-sm sm:text-base font-medium transition-all duration-200 ${isActive
                      ? useLightText
                        ? 'text-yellow-300 bg-white/20 shadow-md'
                        : 'text-red-600 bg-red-50 shadow-md'
                      : useLightText
                        ? 'text-white hover:text-yellow-300 hover:bg-white/10'
                        : 'text-black hover:text-red-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="flex items-center justify-between">
                      {item}
                      {isActive && (
                        <span className={`w-2 h-2 rounded-full ${useLightText ? 'bg-yellow-300' : 'bg-red-600'
                          }`}></span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

/**
 * Statistics Card Component with Animated Counter
 * iOS-optimized with multiple fallback strategies
 */
const StatCard = ({ value, suffix, label, icon, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const timerRef = React.useRef(null);
  const cardRef = React.useRef(null);
  const observerRef = React.useRef(null);
  const hasStartedRef = React.useRef(false);
  const animationFrameRef = React.useRef(null);

  // Detect iOS
  const isIOS = React.useMemo(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }, []);

  const animateCounter = React.useCallback(() => {
    // Prevent multiple starts
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // For iOS, use a more reliable approach
    if (isIOS) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let currentStep = 0;

      const animate = () => {
        currentStep++;
        const newCount = Math.min(Math.ceil(increment * currentStep), value);
        setCount(newCount);

        if (currentStep < steps) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setCount(value);
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
        }
      };

      // Start with a small delay for iOS
      setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(animate);
      }, 50);
    } else {
      // Standard approach for other browsers
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      const stepDuration = duration / steps;

      let currentStep = 0;
      timerRef.current = setInterval(() => {
        currentStep++;
        const newCount = Math.min(Math.ceil(increment * currentStep), value);
        setCount(newCount);

        if (currentStep >= steps) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setCount(value);
        }
      }, stepDuration);
    }
  }, [value, isIOS]);

  useEffect(() => {
    // For iOS, use simpler approach - always animate after mount
    if (isIOS) {
      const startAnimation = () => {
        if (!hasAnimated && !hasStartedRef.current) {
          setHasAnimated(true);
          setTimeout(() => {
            animateCounter();
          }, delay);
        }
      };

      // Multiple fallbacks for iOS
      const timeout1 = setTimeout(startAnimation, 300);
      const timeout2 = setTimeout(startAnimation, 800);
      const timeout3 = setTimeout(startAnimation, 1500);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }

    // For non-iOS, use IntersectionObserver with fallback
    let fallbackTimeout1 = null;
    let fallbackTimeout2 = null;
    let setupObserver = null;

    // Primary fallback
    fallbackTimeout1 = setTimeout(() => {
      if (!hasAnimated && cardRef.current && !hasStartedRef.current) {
        setHasAnimated(true);
        setTimeout(() => {
          animateCounter();
        }, delay);
      }
    }, 500);

    // Secondary fallback
    fallbackTimeout2 = setTimeout(() => {
      if (!hasAnimated && cardRef.current && !hasStartedRef.current) {
        setHasAnimated(true);
        animateCounter();
      }
    }, 2000);

    // Try IntersectionObserver
    setupObserver = setTimeout(() => {
      if (typeof IntersectionObserver !== 'undefined' && cardRef.current) {
        try {
          observerRef.current = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && !hasAnimated && !hasStartedRef.current) {
                  if (fallbackTimeout1) clearTimeout(fallbackTimeout1);
                  if (fallbackTimeout2) clearTimeout(fallbackTimeout2);
                  setHasAnimated(true);
                  setTimeout(() => {
                    animateCounter();
                  }, delay);
                }
              });
            },
            {
              threshold: 0.01,
              rootMargin: '100px'
            }
          );

          const observeElement = () => {
            if (cardRef.current && observerRef.current) {
              try {
                observerRef.current.observe(cardRef.current);
              } catch (e) {
                // Ignore errors
              }
            }
          };

          requestAnimationFrame(observeElement);
          setTimeout(observeElement, 50);
          setTimeout(observeElement, 200);
        } catch (e) {
          // Ignore errors
        }
      }
    }, 100);

    return () => {
      if (fallbackTimeout1) clearTimeout(fallbackTimeout1);
      if (fallbackTimeout2) clearTimeout(fallbackTimeout2);
      if (setupObserver) clearTimeout(setupObserver);
      if (observerRef.current && cardRef.current) {
        try {
          observerRef.current.unobserve(cardRef.current);
          observerRef.current.disconnect();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [delay, hasAnimated, value, suffix, animateCounter, isIOS]);

  // Calculate progress percentage (for percentage values, use count directly; for others, calculate percentage)
  const getProgress = () => {
    if (suffix === '%') {
      return count;
    }
    // For other values, calculate percentage based on reaching the value
    return Math.min((count / value) * 100, 100);
  };

  const progress = getProgress();
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      ref={cardRef}
      id={`stat-${value}-${suffix}`}
      className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 w-full max-w-sm flex flex-col items-center justify-center mx-auto"
    >
      <div className="flex flex-col items-center justify-center w-full">
        {/* Circular Progress Ring */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-3 sm:mb-4 flex items-center justify-center">
          <svg className="transform -rotate-90 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
            {/* Background circle */}
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="none"
              className="sm:stroke-[8]"
            />
            {/* Progress circle */}
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              stroke="#3b82f6"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-300 ease-out sm:stroke-[8]"
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="mb-1 sm:mb-2 flex items-center justify-center">{icon}</div>
            <div className="font-heading text-lg sm:text-xl md:text-2xl font-bold text-blue-700 text-center">
              {count}{suffix}
            </div>
          </div>
        </div>
        {/* Label */}
        <div className="font-sans text-xs sm:text-sm text-gray-600 font-medium text-center w-full uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
};

/**
 * Statistics Section Component
 */
const StatisticsSection = () => {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50"></div>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 justify-items-center">
          <StatCard
            value={20}
            suffix="+"
            label="Years of Experience"
            icon={<img src="/suitcase.png" alt="Years of Experience" className="w-6 h-6" />}
            delay={0}
          />
          <StatCard
            value={5000}
            suffix="+"
            label="Success Visa"
            icon={<img src="/succession.png" alt="Success Visa" className="w-7 h-7" />}
            delay={200}
          />
          <StatCard
            value={98}
            suffix="%"
            label="Visa Ratio"
            icon={<img src="/achievement.png" alt="Visa Ratio" className="w-6 h-6" />}
            delay={400}
          />
        </div>
      </div>
    </section>
  );
};

/**
 * Featured Services Component - Preview of services on Home page
 */
const FeaturedServices = ({ setActiveSection }) => {
  const services = [
    {
      title: "Visa Processing",
      description: "Expert guidance for all types of visa applications.",
      icon: <img src="/visa.png" alt="Visa Processing" className="w-12 h-12" />,
      action: "visa-processing"
    },
    {
      title: "Immigration",
      description: "Seamless immigration services for your dream destination.",
      icon: <img src="/place.png" alt="Immigration" className="w-12 h-12" />,
      action: "immigration"
    },
    {
      title: "Career Counseling",
      description: "Shape your future with our expert career guidance.",
      icon: <img src="/career-choice.png" alt="Career Counseling" className="w-12 h-12" />,
      action: "career-counseling"
    }
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="font-sans text-lg text-gray-600">Tailored solutions for your global ambitions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-gray-50 rounded-xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => setActiveSection('our-services')}
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">{service.title}</h3>
              <p className="font-sans text-gray-600 mb-6">{service.description}</p>
              <div className="flex items-center text-red-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                <span>Explore More</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => setActiveSection('our-services')}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 md:text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View All Services
          </button>
        </div>
      </div>
    </section>
  );
};

/**
 * Process Section Component - Step by step guide
 */
const ProcessSection = () => {
  const steps = [
    {
      number: "01",
      title: "Consultation",
      description: "Book a free consultation with our experts to discuss your goals and eligibility."
    },
    {
      number: "02",
      title: "Assessment",
      description: "We evaluate your profile and recommend the best visa options for you."
    },
    {
      number: "03",
      title: "Documentation",
      description: "Our team assists you in gathering and verifying all necessary documents."
    },
    {
      number: "04",
      title: "Application",
      description: "We submit your application and track its progress until approval."
    }
  ];

  return (
    <section className="py-16 bg-gray-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-overlay filter blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="font-sans text-lg text-gray-400">Your journey to success in 4 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gray-700 -z-10"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-gray-900 border-2 border-red-500 rounded-full flex items-center justify-center text-xl font-bold text-red-500 mb-6 mx-auto lg:mx-0 z-10 relative">
                {step.number}
              </div>
              <h3 className="font-heading text-xl font-bold mb-3 text-center lg:text-left">{step.title}</h3>
              <p className="font-sans text-gray-400 text-center lg:text-left">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Hero Section Component - Main landing area with call-to-action
 * Creative design with hero image background
 */
const HeroSection = ({ setActiveSection }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Background Image - Extends from top of page behind header */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-0"
        style={{
          backgroundImage: 'url(/HeroSection-2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: isMobile ? 'scroll' : 'fixed',
          filter: 'blur(1px)',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>

        {/* Subtle color accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-amber-900/20"></div>

        {/* Top gradient for better header visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        {/* Bottom gradient for content separation */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
      </div>

      <section className="relative min-h-screen flex items-center overflow-hidden z-10">

        {/* Content Container - Premium but natural layout */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-16 sm:py-20 md:py-24 lg:py-32 w-full">
          {/* Main Heading - Clean and premium */}
          <h1 className="font-heading text-4xl xs:text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 sm:mb-8 leading-tight text-white drop-shadow-2xl tracking-tight">
            Your Gateway to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200 animate-gradient">Global Opportunities</span>
          </h1>

          {/* Subtitle - Natural and readable */}
          <p className="font-sans text-lg sm:text-xl md:text-2xl text-blue-50 mb-8 sm:mb-10 leading-relaxed drop-shadow-lg max-w-3xl font-light">
            Easy Go Overseas Advisor is a professional immigration consultant and visa consultant in Anand helping students, job seekers, and families move abroad with confidence.
          </p>

          {/* CTA Buttons - Premium design */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12">
            <button
              onClick={() => setActiveSection('contact-us')}
              className="bg-red-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <img src="/booking.png" alt="Booking" className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Book Consultation</span>
            </button>
            <button
              onClick={() => setActiveSection('our-services')}
              className="bg-white/95 text-gray-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold hover:bg-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <img src="/support.png" alt="Support" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Our Services</span>
            </button>
          </div>

          {/* Trust Indicators - Clean and professional */}
          <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 text-gray-200">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
              <span className="text-sm sm:text-base">98% Success Rate</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
              <span className="text-sm sm:text-base">20+ Years Experience</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
              <span className="text-sm sm:text-base">5000+ Success Stories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <StatisticsSection />

      {/* Featured Services Section */}
      <FeaturedServices setActiveSection={setActiveSection} />

      {/* Process Section */}
      <ProcessSection />

      {/* Testimonials Section */}
      <TestimonialsSection />
    </>
  );
};

/**
 * Visa Processing Details Page Component
 */
const VisaProcessingDetails = ({ onBack, setActiveSection }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    {
      icon: <FileSearch className="w-8 h-8 text-green-400" />,
      title: "Application Assistance",
      description: "Complete guidance through the entire visa application process from start to finish."
    },
    {
      icon: <FileCheck className="w-8 h-8 text-amber-400" />,
      title: "Documentation Support",
      description: "Help with gathering, organizing, and preparing all required documents."
    },
    {
      icon: <UserCheck className="w-8 h-8 text-blue-400" />,
      title: "Interview Preparation",
      description: "Mock interviews and coaching to help you succeed in your visa interview."
    },
    {
      icon: <BadgeCheck className="w-8 h-8 text-purple-400" />,
      title: "Follow-up Support",
      description: "Ongoing assistance even after submission to ensure a smooth process."
    }
  ];

  return (
    <>
      {/* Background Image - Extends from top of page behind header */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-0"
        style={{
          backgroundImage: 'url(/Visa-Approved.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: isMobile ? 'scroll' : 'fixed',
          filter: 'blur(1px)',
        }}
      >
        {/* Overlay for better content visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/15 to-amber-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      </div>

      <section className="relative py-12 sm:py-16 md:py-20 min-h-screen overflow-hidden z-10">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-6 sm:mb-8 flex items-center gap-2 text-white hover:text-yellow-300 transition-colors drop-shadow-lg text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Services</span>
          </button>

          {/* Header */}
          <div className={`text-center mb-8 sm:mb-12 md:mb-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
              <img src="/visa.png" alt="Visa Processing" className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 drop-shadow-lg" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 px-2 sm:px-0 drop-shadow-2xl">Visa Processing</h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 max-w-3xl mx-auto px-2 sm:px-0 drop-shadow-lg">
              Expert assistance with visa applications, documentation, and interview preparation.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white/10 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:bg-white/15 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{feature.title}</h3>
                    <p className="text-white/95 drop-shadow-md">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl p-4 sm:p-5 md:p-6 lg:p-8 mb-6 sm:mb-8 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 md:mb-6 drop-shadow-lg">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 drop-shadow-md">Our Process</h3>
                <ul className="space-y-2 text-white/95">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Detailed profile assessment to match you with the right visa category</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Step-by-step document checklist and review for accuracy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Professional form filling, file preparation, and submission support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Guidance for biometrics, medicals, and interview (where required)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Regular follow-ups and status updates throughout the process</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Post-visa decision counseling and next steps guidance</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 drop-shadow-md">Why Choose Us</h3>
                <ul className="space-y-2 text-white/95">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>20+ years of experience in visa processing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>98% success rate in visa approvals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Personalized attention to each case</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Support for multiple countries and visa types</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Visa Categories Section */}
          <div className={`mb-8 sm:mb-12 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">Visa Categories We Handle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Work Permit", desc: "For employment opportunities overseas" },
                { title: "Tourist Visa", desc: "For travel and leisure purposes" },
                { title: "Business Visa", desc: "For corporate visits and meetings" }
              ].map((visa, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
                  <h3 className="font-heading font-bold text-white text-lg mb-2">{visa.title}</h3>
                  <p className="font-sans text-white/80 text-sm">{visa.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={() => setActiveSection && setActiveSection('contact-us')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all-smooth hover-scale shadow-2xl hover:shadow-blue-500/50"
            >
              Get Started Today
            </button>
          </div>
        </div >
      </section >
    </>
  );
};

/**
 * Immigration Services Details Page Component
 */
const ImmigrationServicesDetails = ({ onBack, setActiveSection }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    {
      icon: <Home className="w-8 h-8 text-blue-400" />,
      title: "Permanent Residency",
      description: "Complete guidance for PR applications including Express Entry, PNP, and family sponsorship programs."
    },
    {
      icon: <Award className="w-8 h-8 text-amber-400" />,
      title: "Citizenship Applications",
      description: "Assistance with citizenship requirements, documentation, and the naturalization process."
    },
    {
      icon: <FileCheck className="w-8 h-8 text-green-400" />,
      title: "Document Preparation",
      description: "Expert help with gathering and organizing all required immigration documents."
    },
    {
      icon: <Plane className="w-8 h-8 text-purple-400" />,
      title: "Application Review",
      description: "Thorough review of your application to ensure accuracy and completeness before submission."
    }
  ];

  return (
    <>
      {/* Background Image - Extends from top of page behind header */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-0"
        style={{
          backgroundImage: 'url(/Immigration--service.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: isMobile ? 'scroll' : 'fixed',
          filter: 'blur(1px)',
        }}
      >
        {/* Overlay for better content visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/15 to-amber-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      </div>

      <section className="relative py-12 sm:py-16 md:py-20 min-h-screen overflow-hidden z-10">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-6 sm:mb-8 flex items-center gap-2 text-white hover:text-yellow-300 transition-colors drop-shadow-lg text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Services</span>
          </button>

          {/* Header */}
          <div className={`text-center mb-8 sm:mb-12 md:mb-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
              <img src="/place.png" alt="Immigration Services" className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 drop-shadow-lg" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 px-2 sm:px-0 drop-shadow-2xl">Immigration Services</h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 max-w-3xl mx-auto px-2 sm:px-0 drop-shadow-lg">
              Comprehensive support for permanent residency and citizenship applications.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white/10 backdrop-blur-md p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:bg-white/15 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 drop-shadow-lg">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-white/95 drop-shadow-md">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl p-4 sm:p-5 md:p-6 lg:p-8 mb-6 sm:mb-8 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 md:mb-6 drop-shadow-lg">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2 sm:mb-3 drop-shadow-md">Our Process</h3>
                <ul className="space-y-2 text-white/95">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>In-depth consultation on work permits and PR options for different countries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Evaluation of points, eligibility, occupation lists, and documentation readiness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Guidance for permanent residency applications and long-term settlement plans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Strategic advice to improve your profile before applying</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Assistance with spouse and dependent applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Post-landing services and settlement guidance</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 drop-shadow-md">Why Choose Us</h3>
                <ul className="space-y-2 text-white/95">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Expert knowledge of immigration programs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Personalized immigration strategy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Ongoing support throughout the process</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>High success rate in applications</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Popular Destinations Section */}
          <div className={`mb-8 sm:mb-12 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">Popular Destinations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { country: "Canada", desc: "Express Entry, PNP, and Family Sponsorship programs" },
                { country: "Australia", desc: "Skilled Migration and Business Innovation visas" },
                { country: "United Kingdom", desc: "Skilled Worker and Global Talent routes" }
              ].map((dest, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/20 transition-colors text-center">
                  <h3 className="font-heading font-bold text-white text-xl mb-2">{dest.country}</h3>
                  <p className="font-sans text-white/80">{dest.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={() => setActiveSection && setActiveSection('contact-us')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all-smooth hover-scale shadow-2xl hover:shadow-blue-500/50"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </section >
    </>
  );
};

/**
 * Career Counseling Details Page Component
 */
const CareerCounselingDetails = ({ onBack, setActiveSection }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    {
      icon: <Search className="w-8 h-8 text-blue-400" />,
      title: "Career Assessment",
      description: "Comprehensive evaluation of your skills, interests, and career goals to identify the best opportunities."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-amber-400" />,
      title: "Job Market Analysis",
      description: "In-depth research on job markets, salary trends, and demand for your profession in different countries."
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-green-400" />,
      title: "Skill Development",
      description: "Guidance on certifications, training, and education needed to enhance your career prospects abroad."
    },
    {
      icon: <Users className="w-8 h-8 text-purple-400" />,
      title: "Career Planning",
      description: "Strategic career roadmap tailored to help you achieve your professional goals internationally."
    }
  ];

  return (
    <>
      {/* Background Image - Extends from top of page behind header */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-0"
        style={{
          backgroundImage: 'url(/Career-counselinng.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: isMobile ? 'scroll' : 'fixed',
          filter: 'blur(1px)',
        }}
      >
        {/* Overlay for better content visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/15 to-amber-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      </div>

      <section className="relative py-12 sm:py-16 md:py-20 min-h-screen overflow-hidden z-10">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-6 sm:mb-8 flex items-center gap-2 text-white hover:text-yellow-300 transition-colors drop-shadow-lg text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Services</span>
          </button>

          {/* Header */}
          <div className={`text-center mb-8 sm:mb-12 md:mb-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
              <img src="/career-choice.png" alt="Career Counseling" className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 drop-shadow-lg" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 px-2 sm:px-0 drop-shadow-2xl">Career Counseling</h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 max-w-3xl mx-auto px-2 sm:px-0 drop-shadow-lg">
              Professional guidance to help you choose the right career path and opportunities abroad.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white/10 backdrop-blur-md p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:bg-white/15 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 drop-shadow-lg">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-white/95 drop-shadow-md">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className={`bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl p-4 sm:p-5 md:p-6 lg:p-8 mb-6 sm:mb-8 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 md:mb-6 drop-shadow-lg">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 drop-shadow-md">Our Process</h3>
                <ul className="space-y-2 text-white/95">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Understanding your education, skills, work experience, and future goals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Recommending suitable countries, programs, or study options based on market demand</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Explaining job market trends, skill demand, and realistic expectations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Helping you choose between work, study, or PR pathways</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Guidance on language requirements, certifications, and skill upgrades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Financial planning and scholarship opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Long-term career roadmap for overseas success</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 drop-shadow-md">Why Choose Us</h3>
                <ul className="space-y-2 text-white/95">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Expert career counselors with international experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Comprehensive market insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Tailored career strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>Ongoing support and mentorship</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Industries Section */}
          <div className={`mb-8 sm:mb-12 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">Industries We Cover</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Information Technology", icon: "💻" },
                { name: "Healthcare & Medicine", icon: "🏥" },
                { name: "Business & Management", icon: "📊" },
                { name: "Engineering", icon: "⚙️" },
                { name: "Hospitality & Tourism", icon: "🏨" },
                { name: "Creative Arts", icon: "🎨" }
              ].map((industry, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-colors flex items-center gap-4">
                  <span className="text-3xl">{industry.icon}</span>
                  <h3 className="font-heading font-bold text-white text-lg">{industry.name}</h3>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={() => setActiveSection && setActiveSection('contact-us')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all-smooth hover-scale shadow-2xl hover:shadow-blue-500/50"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

/**
 * Services Section Component - Displays available services
 */
const ServicesSection = ({ setActiveSection }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [flippedCard, setFlippedCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCardClick = (serviceId) => {
    // Start flip animation
    setFlippedCard(serviceId);

    // Scroll to top when opening service detail to keep header transparent
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Show details page after flip completes
    setTimeout(() => {
      setActiveService(serviceId);
      setFlippedCard(null);
    }, 600); // Wait for flip animation to complete (0.6s)
  };

  const handleBack = () => {
    setActiveService(null);
    setFlippedCard(null);
  };

  const services = [
    {
      icon: <img src="/visa.png" alt="Visa Processing" className="w-12 h-12" />,
      title: "Visa Processing",
      description: "Expert assistance with visa applications, documentation, and interview preparation.",
      onClick: () => handleCardClick('visa'),
      id: 'visa',
      backIcon: <img src="/visa.png" alt="Visa Processing" className="w-16 h-16 mb-4" />
    },
    {
      icon: <img src="/place.png" alt="Immigration Services" className="w-12 h-12" />,
      title: "Immigration Services",
      description: "Comprehensive support for permanent residency and citizenship applications.",
      onClick: () => handleCardClick('immigration'),
      id: 'immigration',
      backIcon: <img src="/place.png" alt="Immigration Services" className="w-16 h-16 mb-4" />
    },
    {
      icon: <img src="/career-choice.png" alt="Career Counseling" className="w-12 h-12" />,
      title: "Career Counseling",
      description: "Professional guidance to help you choose the right career path and opportunities abroad.",
      onClick: () => handleCardClick('career'),
      id: 'career',
      backIcon: <img src="/career-choice.png" alt="Career Counseling" className="w-16 h-16 mb-4" />
    }
  ];

  if (activeService === 'visa') {
    return <VisaProcessingDetails onBack={handleBack} setActiveSection={setActiveSection} />;
  }

  if (activeService === 'immigration') {
    return <ImmigrationServicesDetails onBack={handleBack} setActiveSection={setActiveSection} />;
  }

  if (activeService === 'career') {
    return <CareerCounselingDetails onBack={handleBack} setActiveSection={setActiveSection} />;
  }

  return (
    <>
      {/* Background Image - Extends from top of page behind header */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-0"
        style={{
          backgroundImage: 'url(/visa-application-form-laptop.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: isMobile ? 'scroll' : 'fixed',
          filter: 'blur(1px)',
        }}
      >
        {/* Overlay for better content visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/15 to-amber-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      </div>

      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden z-10">

        {/* Floating Decorative Elements */}
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl animate-blob z-10"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000 z-10"></div>

        <style>{`
        .flip-card {
          perspective: 1000px;
          cursor: pointer;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s ease-in-out;
          transform-style: preserve-3d;
        }
        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 0.5rem;
        }
        .flip-card-back {
          transform: rotateY(180deg);
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 1.5rem;
          color: #1f2937;
          border: 1px solid #e5e7eb;
        }
        .flip-card-back h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
          text-align: center;
        }
        .flip-card-back p {
          text-align: center;
          font-size: 0.875rem;
          opacity: 0.9;
        }
        @media (min-width: 640px) {
          .flip-card-back {
            padding: 2rem;
          }
          .flip-card-back h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }
          .flip-card-back p {
            font-size: 0.9rem;
          }
        }
      `}</style>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-10 sm:mb-12 md:mb-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 md:mb-4 px-2 sm:px-0 drop-shadow-lg">Our Services</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 px-2 sm:px-0 drop-shadow-md">Comprehensive solutions for your overseas journey</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {services.map((service, index) => {
              const isFlipped = flippedCard === service.id;

              return (
                <div
                  key={index}
                  className={`flip-card ${isFlipped ? 'flipped' : ''} ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  onClick={service.onClick || undefined}
                >
                  <div className="flip-card-inner" style={{ minHeight: '280px' }}>
                    {/* Front of Card */}
                    <div className="flip-card-front text-center p-6 sm:p-8 rounded-2xl border border-white/40 hover:border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white/80 backdrop-blur-md touch-manipulation flex flex-col justify-center items-center group">
                      <div className="flex justify-center mb-6 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                        {service.icon}
                      </div>
                      <h3 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                      <p className="font-sans text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                      <div className="mt-auto">
                        <span className="inline-flex items-center text-sm font-semibold text-red-600 group-hover:text-red-700 transition-colors">
                          Learn More <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </span>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div className="flip-card-back p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-xl">
                      <div className="w-16 h-16 mb-4 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        {service.backIcon}
                      </div>
                      <h3 className="font-heading text-2xl font-bold mb-2">{service.title}</h3>
                      <p className="font-sans text-white/90 text-sm">Click to view full details</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

/**
 * About Us Section Component - Company information and story
 */
const AboutUsSection = ({ setActiveSection }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const values = [
    {
      icon: <img src="/leader.png" alt="Expert Guidance" className="w-12 h-12" />,
      title: 'Expert Guidance',
      description: '20+ years of combined experience in immigration and visa services'
    },
    {
      icon: <img src="/customer-success.png" alt="High Success Rate" className="w-12 h-12" />,
      title: 'High Success Rate',
      description: '98% visa approval rate with personalized attention to each case'
    },
    {
      icon: <img src="/relationship.png" alt="Trusted Partner" className="w-12 h-12" />,
      title: 'Trusted Partner',
      description: '5000+ successful visa applications and satisfied clients worldwide'
    },
    {
      icon: <img src="/international-trade.png" alt="Global Reach" className="w-12 h-12" />,
      title: 'Global Reach',
      description: 'Expertise in multiple countries and visa categories'
    }
  ];

  return (
    <>
      {/* Background Image - Extends from top of page behind header */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-0"
        style={{
          backgroundImage: 'url(/vission-mission-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: isMobile ? 'scroll' : 'fixed',
          filter: 'blur(1px)',
        }}
      >
        {/* Elegant Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-amber-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center overflow-hidden z-10">

        {/* Floating Decorative Elements */}
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl animate-blob z-10"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000 z-10"></div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className={`text-center ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 px-2 sm:px-0 drop-shadow-2xl">
              About <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">Easy Go</span> <span className="bg-gradient-to-r from-amber-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Overseas</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/95 max-w-3xl mx-auto px-2 sm:px-0 drop-shadow-lg">
              Your trusted partner in making global opportunities accessible
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden z-10">

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
            {/* Mission Card with Glassmorphism */}
            <div className={`${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 lg:p-10 border border-white/20 shadow-2xl hover:bg-white/15 transition-colors duration-300">
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">Our Mission</h2>
                <p className="font-sans text-base sm:text-lg text-white/90 mb-4 leading-relaxed drop-shadow-md font-light text-justify">
                  At Easy Go Overseas Advisor, our mission is to transform immigration dreams into reality by providing expert guidance for work permits, permanent residency, and visa services while keeping every process transparent, organized, and stress-free.
                </p>
                <p className="font-sans text-base sm:text-lg text-white/90 leading-relaxed drop-shadow-md font-light text-justify">
                  We aim to be the most trusted partner for students, professionals, and families who want to work, or travel abroad from Anand and surrounding areas.
                </p>
              </div>
            </div>

            {/* Vision Card with Glassmorphism */}
            <div className={`${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 lg:p-10 border border-white/20 shadow-2xl hover:bg-white/15 transition-colors duration-300">
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">Our Vision</h2>
                <p className="font-sans text-base sm:text-lg text-white/90 mb-4 leading-relaxed drop-shadow-md font-light text-justify">
                  To become the most trusted and reliable immigration consultancy, recognized for our integrity, expertise, and commitment to client success. We envision a world where borders don't limit dreams, and everyone can access the opportunities they deserve.
                </p>
                <p className="font-sans text-base sm:text-lg text-white/90 leading-relaxed drop-shadow-md font-light text-justify">
                  Through continuous learning and adaptation, we stay at the forefront of immigration policies and procedures to serve our clients better.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <StatisticsSection />

      {/* Why Choose Us Section */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-white z-10">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-8 sm:mb-12 md:mb-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 px-2 sm:px-0">Why Choose Us?</h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 px-2 sm:px-0">What sets us apart in the immigration industry</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className={`bg-white p-5 sm:p-6 md:p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="flex justify-center mb-3 sm:mb-4 transform transition-transform duration-300 hover:scale-110">
                  {value.icon}
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">{value.title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-700 text-center leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-gray-50 z-10">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0">Our Story</h2>
            <div className="space-y-4 sm:space-y-5 md:space-y-6 text-sm sm:text-base md:text-lg text-gray-700 text-justify leading-relaxed">
              <p>
                Easy Go Overseas Advisor was founded in 1999 by Mr. Alpeshkumar Suthar with the goal of making overseas migration dreams easier for people from Gujarat. Over the years, the consultancy has grown into a well-known name among foreign visa consultants and overseas job consultants, with 5000+ success stories.
              </p>
              <p>
                The mission is to transform immigration dreams into reality by providing expert guidance for work permits, permanent residency, and visa services while keeping every process transparent, organized, and stress-free. The vision is to become the most trusted partner for students, professionals, and families who want to work, or travel abroad from Anand and surrounding areas.
              </p>
              <p>
                With a dedicated team of immigration consultant and visa consultant specialists for each country, Easy Go Overseas Advisor offers the right combination of experience and personal attention.
              </p>
            </div>
            <div className="mt-8 sm:mt-10 md:mt-12">
              <button
                onClick={() => setActiveSection('contact-us')}
                className="bg-red-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Get Started Today
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-white z-10">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="font-sans text-lg text-gray-600">The principles that guide our work every day</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Integrity", desc: "We operate with complete transparency and honesty in all our dealings.", icon: "💎" },
              { title: "Excellence", desc: "We strive for the highest quality in our services and results.", icon: "⭐" },
              { title: "Client-Centric", desc: "Your success and satisfaction are our top priorities.", icon: "🤝" },
              { title: "Innovation", desc: "We constantly adapt to the changing immigration landscape.", icon: "💡" }
            ].map((value, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 text-center group">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{value.icon}</div>
                <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">{value.title}</h3>
                <p className="font-sans text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

/**
 * Contact Form Component - Appointment booking form with validation
 */
const ContactForm = () => {
  // State management for form data and validation
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Add this state for the date picker
  const [selectedDate, setSelectedDate] = useState(null);

  /**
   * Handle input changes with real-time sanitization
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Handle form submission with WhatsApp redirection
   */
  const handleSubmit = async () => {
    // Validate form data
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    setErrors({});

    try {
      // Format the message for WhatsApp
      const message = `*New Consultation Request*\n\n` +
        `*Name:* ${formData.name}\n` +
        `*Email:* ${formData.email}\n` +
        `*Phone:* ${formData.phone}\n` +
        `*State:* ${formData.state}\n` +
        `*Service:* ${formData.service}\n` +
        `*Preferred Date:* ${selectedDate ? selectedDate.toLocaleDateString() : 'Not specified'}\n\n` +
        `*Details:*\n` +
        `English Level: ${formData.englishLevel}\n` +
        `Age: ${formData.age}\n` +
        `Education: ${formData.education}\n` +
        `Experience: ${formData.experience}\n` +
        `Visa Type: ${formData.visaType}\n\n` +
        `*Message:* ${formData.message || 'N/A'}`;

      // Encode the message for URL
      const encodedMessage = encodeURIComponent(message);

      // WhatsApp API URL (using the business number)
      const whatsappUrl = `https://wa.me/916359502902?text=${encodedMessage}`;

      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');

      setFormData(initialFormData);
      setSelectedDate(null);
    } catch (error) {
      setSubmitMessage('Sorry, there was an error redirecting to WhatsApp. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Elegant gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80"></div>
      {/* Decorative circles - matching color scheme */}
      <div className="absolute top-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      <div className="absolute bottom-10 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 sm:w-80 h-56 sm:h-80 bg-amber-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-6 sm:mb-8 md:mb-12 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 px-2 sm:px-0">Book Your Consultation</h2>
          <p className="font-sans text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 px-2 sm:px-0">Take the first step towards your overseas journey</p>
        </div>

        <div className={`bg-white rounded-lg shadow-lg p-4 sm:p-5 md:p-6 lg:p-8 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          {submitMessage && (
            <div className={`mb-6 p-4 rounded-lg animate-bounce-in ${submitMessage.includes('Thank you')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
              {submitMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth text-sm sm:text-base ${errors.name ? 'border-red-500 error' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth text-sm sm:text-base ${errors.email ? 'border-red-500 error' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth text-sm sm:text-base ${errors.phone ? 'border-red-500 error' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* State Field */}
            <div>
              <label htmlFor="state" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth ${errors.state ? 'border-red-500 error' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg bg-white text-sm sm:text-base`}
              >
                <option value="">Select your state</option>
                {['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
                  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
                  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
                  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
                  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
                  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
                  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'].map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
              </select>
              {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
            </div>

            {/* Service Selection */}
            <div>
              <label htmlFor="service" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Service Required *
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth ${errors.service ? 'border-red-500 error' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg bg-white text-sm sm:text-base`}
              >
                <option value="">Select a service</option>
                {/* <option value="study-abroad">Study Abroad Consulting</option> */}
                <option value="visa-processing">Visa Processing</option>
                <option value="immigration">Immigration Services</option>
                <option value="career-counseling">Career Counseling</option>
              </select>
              {errors.service && <p className="mt-1 text-sm text-red-600">{errors.service}</p>}
            </div>

            {/* Preferred Date */}
            <div>
              <label htmlFor="preferredDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Preferred Consultation Date *
              </label>
              <ReactDatePicker
                selected={selectedDate}
                onChange={date => {
                  setSelectedDate(date);
                  handleInputChange({
                    target: {
                      name: 'preferredDate',
                      value: date ? date.toISOString().split('T')[0] : ''
                    }
                  });
                }}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select a date"
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth ${errors.preferredDate ? 'border-red-500 error' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg text-sm sm:text-base`}
              />
              {errors.preferredDate && <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>}
            </div>

            {/* Eligibility Section - Full Width */}
            <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6 md:col-span-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Fill other details</h3>

              {/* English Level */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  What is your english level<span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {['Excellent (8+ Band)', 'Good (7 Band)', 'Average (6 Band)', 'Poor (5 Band)', 'Very Poor (4 Band)'].map((level) => (
                    <label key={level} className={`flex items-center p-2 sm:p-2.5 border rounded-lg cursor-pointer transition-all-smooth touch-manipulation ${formData.englishLevel === level
                      ? 'border-red-500 bg-red-50 shadow-sm'
                      : 'border-gray-300 hover:border-red-300 hover:bg-gray-50 active:bg-gray-100'
                      }`}>
                      <input
                        type="radio"
                        name="englishLevel"
                        value={level}
                        checked={formData.englishLevel === level}
                        onChange={handleInputChange}
                        className="mr-2 sm:mr-3 flex-shrink-0"
                      />
                      <span className={`text-xs sm:text-sm break-words transition-colors ${formData.englishLevel === level ? 'text-red-700 font-medium' : 'text-gray-700'
                        }`}>{level}</span>
                    </label>
                  ))}
                </div>
                {errors.englishLevel && <p className="mt-1 text-sm text-red-600">{errors.englishLevel}</p>}
              </div>

              {/* Age */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Age<span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {['Under 18 years', '18-35 years', '36-40 years', '40 years+'].map((ageGroup) => (
                    <label key={ageGroup} className={`flex items-center p-2 sm:p-2.5 border rounded-lg cursor-pointer transition-all-smooth touch-manipulation ${formData.age === ageGroup
                      ? 'border-red-500 bg-red-50 shadow-sm'
                      : 'border-gray-300 hover:border-red-300 hover:bg-gray-50 active:bg-gray-100'
                      }`}>
                      <input
                        type="radio"
                        name="age"
                        value={ageGroup}
                        checked={formData.age === ageGroup}
                        onChange={handleInputChange}
                        className="mr-2 sm:mr-3 flex-shrink-0"
                      />
                      <span className={`text-xs sm:text-sm transition-colors ${formData.age === ageGroup ? 'text-red-700 font-medium' : 'text-gray-700'
                        }`}>{ageGroup}</span>
                    </label>
                  ))}
                </div>
                {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
              </div>

              {/* Education */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Education<span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {['PHD', 'Masters', 'Post Graduation', 'Two or more Certificates', 'Graduation', 'Diploma 3 years'].map((edu) => (
                    <label key={edu} className={`flex items-center p-2 sm:p-2.5 border rounded-lg cursor-pointer transition-all-smooth touch-manipulation ${formData.education === edu
                      ? 'border-red-500 bg-red-50 shadow-sm'
                      : 'border-gray-300 hover:border-red-300 hover:bg-gray-50 active:bg-gray-100'
                      }`}>
                      <input
                        type="radio"
                        name="education"
                        value={edu}
                        checked={formData.education === edu}
                        onChange={handleInputChange}
                        className="mr-2 sm:mr-3 flex-shrink-0"
                      />
                      <span className={`text-xs sm:text-sm break-words transition-colors ${formData.education === edu ? 'text-red-700 font-medium' : 'text-gray-700'
                        }`}>{edu}</span>
                    </label>
                  ))}
                </div>
                {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
              </div>

              {/* Experience */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Experience<span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {['1 year', '2-3 years', '4-5 years', '6 or more years'].map((exp) => (
                    <label key={exp} className={`flex items-center p-2 sm:p-2.5 border rounded-lg cursor-pointer transition-all-smooth touch-manipulation ${formData.experience === exp
                      ? 'border-red-500 bg-red-50 shadow-sm'
                      : 'border-gray-300 hover:border-red-300 hover:bg-gray-50 active:bg-gray-100'
                      }`}>
                      <input
                        type="radio"
                        name="experience"
                        value={exp}
                        checked={formData.experience === exp}
                        onChange={handleInputChange}
                        className="mr-2 sm:mr-3 flex-shrink-0"
                      />
                      <span className={`text-xs sm:text-sm transition-colors ${formData.experience === exp ? 'text-red-700 font-medium' : 'text-gray-700'
                        }`}>{exp}</span>
                    </label>
                  ))}
                </div>
                {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience}</p>}
              </div>

              {/* Visa Type */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Visa Type<span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {['Express Entry', 'PNP', 'Business Investor Program', 'Work Permit', 'Visitor Visa', 'Tourist', 'Others'].map((visa) => (
                    <label key={visa} className={`flex items-center p-2 sm:p-2.5 border rounded-lg cursor-pointer transition-all-smooth touch-manipulation ${formData.visaType === visa
                      ? 'border-red-500 bg-red-50 shadow-sm'
                      : 'border-gray-300 hover:border-red-300 hover:bg-gray-50 active:bg-gray-100'
                      }`}>
                      <input
                        type="radio"
                        name="visaType"
                        value={visa}
                        checked={formData.visaType === visa}
                        onChange={handleInputChange}
                        className="mr-2 sm:mr-3 flex-shrink-0"
                      />
                      <span className={`text-xs sm:text-sm break-words transition-colors ${formData.visaType === visa ? 'text-red-700 font-medium' : 'text-gray-700'
                        }`}>{visa}</span>
                    </label>
                  ))}
                </div>
                {errors.visaType && <p className="mt-1 text-sm text-red-600">{errors.visaType}</p>}
              </div>
            </div>

            {/* Message Field - Full Width */}
            <div className="md:col-span-2">
              <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Additional Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth text-sm sm:text-base resize-none ${errors.message ? 'border-red-500 error' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg`}
                placeholder="Tell us about your goals and requirements..."
              />
              {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
            </div>

            {/* Submit Button - Full Width */}
            <div className="text-center md:col-span-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white font-bold py-3 sm:py-4 rounded-lg hover:bg-green-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Redirecting...' : (
                  <>
                    <span>Send via WhatsApp</span>
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}

    </section>
  );
};

/**
 * Testimonials Section Component
 */
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Annuridh ",
      role: "Visitor Visa - Canada",
      content: "Easy Go Overseas made my dream to visit Canada a reality. Their guidance and visa documentation was impeccable."
    },
    {
      name: "Masuma ",
      role: "Work Permit - Canada",
      content: "I was struggling with my work permit application for the canada. The team at Easy Go Overseas handled everything professionally and I got my visa in record time."
    },
    {
      name: "Ekta",
      role: "PR - Canada",
      content: "Highly recommended for PR services. They are very transparent about the process and kept me updated at every step. Thank you for your support!"
    }
  ];

  return (
    <section className="relative z-10 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">Client Testimonials</h2>
          <p className="font-sans text-lg text-gray-600">What our successful clients say about us</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div>
                  <h4 className="font-heading font-bold text-lg text-gray-900">{testimonial.name}</h4>
                  <p className="font-sans text-sm text-blue-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="font-sans text-gray-600 italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * FAQ Section Component
 */
const FAQSection = () => {
  const faqs = [
    {
      question: "How long does the visa process usually take?",
      answer: "The processing time varies depending on the country and visa type. Generally, student visas take 4-8 weeks, while PR applications can take 6-12 months. We provide a more accurate timeline after assessing your specific case."
    },
    {
      question: "Do you offer guaranteed visa approval?",
      answer: "While we have a 98% success rate, no legitimate consultancy can guarantee a visa as the final decision lies with the embassy. However, we ensure your application is flawless to maximize your chances."
    },
    {
      question: "What documents are required for a consultation?",
      answer: "For the initial consultation, bring your valid passport, educational certificates, and resume. If you have any specific test scores (IELTS/TOEFL) or work experience letters, those are helpful too."
    },
    {
      question: "Do you help with post-landing services?",
      answer: "Yes, we assist with pre-departure briefings, accommodation search, and airport pickup arrangements to ensure you settle in comfortably in your new country."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="font-sans text-lg text-gray-600">Common queries about our services and process</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-heading font-semibold text-gray-900">{faq.question}</span>
                <span className={`transform transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="px-6 py-4 bg-white">
                  <p className="font-sans text-gray-600">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Footer Component - Contact information and company details
 */
const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-8 sm:py-10 md:py-12 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <img
                src="/Logo.jpg"
                alt="Logo"
                className="h-10 sm:h-12 w-auto object-contain"
                style={{ maxHeight: '48px', objectFit: 'contain' }}
              />
            </div>
            <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">
              Your trusted partner for overseas, immigration, and career opportunities.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact Information</h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img src="/phone-call.png" alt="Phone" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-300 break-all">+91 63595 02902</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <img src="/communication.png" alt="Email" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-300 break-all">egoc99@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Office Address</h4>
            <a
              href="https://www.google.com/maps/search/?api=1&query=120+Narayan+Empire+Anand-Vidhyanagar+Road+Anand+Gujarat+388120+India"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start space-x-2 sm:space-x-3 hover:text-yellow-300 transition-colors duration-200 cursor-pointer group"
            >
              <img src="/map.png" alt="Location" className="w-4 h-4 sm:w-5 sm:h-5 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-sm sm:text-base text-gray-300 group-hover:text-yellow-300 transition-colors duration-200">
                <p>120, Narayan Empire, A.V Road,</p>
                <p>Near Tata Croma, Anand – 388120,</p>
                <p>Gujarat, India</p>
                <p className="text-xs sm:text-sm text-yellow-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">Click to open in Google Maps →</p>
              </div>
            </a>
            <div className="mt-3 sm:mt-4 flex items-center space-x-2 sm:space-x-3">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <span className="text-sm sm:text-base text-gray-300">9:00 AM – 7:00 PM (IST)</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-400 px-2">
            © 2024 Easy Go Overseas. All rights reserved. | Making overseas dreams come true.
          </p>
        </div>
      </div>
    </footer>
  );
};

// =============================================================================
// CONTROLLER LAYER - Main App Component
// =============================================================================

/**
 * Main Application Component - Controls the entire application flow
 * This component manages the state and navigation between different sections
 */
const EasyGoOverseas = () => {
  // State to track which section is currently active
  const [activeSection, setActiveSection] = useState('home');
  const [isTransitioning, setIsTransitioning] = useState(false);

  /**
   * Handle section change with smooth transition
   */
  const handleSectionChange = (section) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(section);
      setIsTransitioning(false);
    }, 150); // Brief transition delay
  };

  /**
   * Render the appropriate section based on active state
   */
  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HeroSection setActiveSection={handleSectionChange} />;
      case 'about-us':
        return <AboutUsSection setActiveSection={handleSectionChange} />;
      case 'our-services':
        return <ServicesSection setActiveSection={handleSectionChange} />;
      case 'contact-us':
        return <ContactForm />;
      default:
        return <HeroSection setActiveSection={handleSectionChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Always visible */}
      <Header activeSection={activeSection} setActiveSection={handleSectionChange} />

      {/* Main Content - Changes based on active section */}
      <main className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {renderSection()}
      </main>

      {/* Footer - Always visible */}
      <Footer />
    </div>
  );
};

// Export the main component as default
export default EasyGoOverseas;